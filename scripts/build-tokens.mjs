/**
 * tokens/tokens.json (Tokens Studio, DTCG) → src/styles/tokens.css
 *
 * 디자이너가 Figma Tokens Studio 에서 Push 하면 CI 가 이 스크립트를 돌린다.
 * 직접 실행하려면 `npm run tokens:build`.
 */
import { register } from '@tokens-studio/sd-transforms'
import fs from 'node:fs'
import path from 'node:path'
import StyleDictionary from 'style-dictionary'

register(StyleDictionary)

const SRC = 'tokens/tokens.json'
const OUT = 'src/styles/tokens.css'
const TMP = 'node_modules/.cache/design-tokens'

const PRIMITIVE = '[DS] Primitive/Value'
const SEMANTIC = { light: '[DS] Semantic/Light', dark: '[DS] Semantic/Dark' }

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'))

/**
 * Primitive 와 Semantic 이 둘 다 gray 그룹을 가지고 있다.
 * 얕은 병합이면 한쪽이 통째로 덮여서 {gray.800} 참조가 풀리지 않는다.
 */
const merge = (a, b) => {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) {
    out[k] =
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !('$value' in v) &&
      out[k]
        ? merge(out[k], v)
        : v
  }
  return out
}

fs.rmSync(TMP, { recursive: true, force: true })
fs.mkdirSync(TMP, { recursive: true })

// 타이포 세트까지 전부 넣어야 {font-family.base} 같은 세트 간 참조가 풀린다.
// 색상만 출력하지만 참조 해석에는 전 세트가 필요하다.
for (const [theme, set] of Object.entries(SEMANTIC)) {
  const other = Object.values(SEMANTIC).find((s) => s !== set)
  const merged = raw.$metadata.tokenSetOrder
    .filter((s) => s !== other && raw[s])
    .reduce((acc, s) => merge(acc, raw[s]), {})
  fs.writeFileSync(path.join(TMP, `${theme}.json`), JSON.stringify(merged))
}

const kebab = (s) => s.replace(/\s+/g, '-').toLowerCase()

async function collectColors(theme) {
  const sd = new StyleDictionary({
    source: [path.join(TMP, `${theme}.json`)],
    preprocessors: ['tokens-studio'],
    platforms: {
      css: { transformGroup: 'tokens-studio', transforms: ['name/kebab'] },
    },
    log: { warnings: 'disabled' },
  })
  const dict = await sd.getPlatformTokens('css')
  return dict.allTokens.filter((t) => t.$type === 'color')
}

const light = await collectColors('light')
const dark = await collectColors('dark')

// gray 가 양쪽 세트에 있으므로 최상위 키가 아니라 전체 경로로 판별한다.
const isPrimitive = (t) =>
  t.path.reduce(
    (node, key) => (node && typeof node === 'object' ? node[key] : undefined),
    raw[PRIMITIVE],
  ) !== undefined

const name = (t) => kebab(t.path.join('-'))

/** {green.600} 을 하드코딩 값이 아니라 팔레트 변수 참조로 남긴다. */
const ref = (t) => {
  const m = /^\{([^}]+)\}$/.exec(String(t.original.$value).trim())
  return m ? `var(--palette-${kebab(m[1].replace(/\./g, '-'))})` : t.$value
}

const palette = light.filter(isPrimitive)
const semantic = light.filter((t) => !isPrimitive(t))
const darkByName = new Map(
  dark.filter((t) => !isPrimitive(t)).map((t) => [name(t), t]),
)

const out = []
out.push('/* 자동 생성 파일입니다. 직접 수정하지 마세요. */')
out.push('/* 색을 바꾸려면 Figma Tokens Studio 에서 Push 하세요. */')
out.push('/* 생성: npm run tokens:build */')
out.push('')
out.push(':root {')
out.push('  /* primitive palette */')
for (const t of palette) out.push(`  --palette-${name(t)}: ${t.$value};`)
out.push('')
out.push('  /* semantic (light) */')
for (const t of semantic) out.push(`  --sem-${name(t)}: ${ref(t)};`)
out.push('}')
out.push('')
out.push(
  '/* 다크모드는 아직 쓰지 않는다. data-theme 이 붙기 전까지 이 블록은 적용되지 않는다. */',
)
out.push("[data-theme='dark'] {")
for (const t of semantic) {
  const d = darkByName.get(name(t))
  if (d) out.push(`  --sem-${name(t)}: ${ref(d)};`)
}
out.push('}')
out.push('')
out.push('@theme inline {')
out.push('  /* Tailwind 기본 팔레트와 구 커스텀 색을 모두 지운다. */')
out.push(
  '  /* 토큰에 없는 색 클래스는 CSS 가 아예 생성되지 않아 바로 눈에 띈다. */',
)
out.push('  --color-*: initial;')
out.push('')
out.push('  /* 원시 팔레트는 --color-* 에 넣지 않는다. */')
out.push(
  '  /* bg-green-600 같은 유틸리티가 생기면 시맨틱 토큰을 우회하게 된다. */',
)
for (const t of semantic)
  out.push(`  --color-${name(t)}: var(--sem-${name(t)});`)
out.push('}')
out.push('')

// --- 타이포 ---
// 합성 토큰(fontSize + lineHeight + letterSpacing + fontWeight)이라
// Style Dictionary 의 font shorthand 변환을 타면 속성이 깎인다. 직접 푼다.
const WEIGHT = {
  Bold: 700,
  SemiBold: 600,
  Medium: 500,
  Regular: 400,
  Light: 300,
}

const lightTree = JSON.parse(
  fs.readFileSync(path.join(TMP, 'light.json'), 'utf8'),
)

/** {line-height.3xl} 같은 참조를 병합 트리에서 실제 값으로 푼다. */
const deref = (v, depth = 0) => {
  const m = /^\{([^}]+)\}$/.exec(String(v).trim())
  if (!m || depth > 6) return v
  const node = m[1]
    .split('.')
    .reduce(
      (n, k) => (n && typeof n === 'object' ? n[k] : undefined),
      lightTree,
    )
  return node === undefined ? v : deref(node.$value ?? node, depth + 1)
}

const typo = []
for (const [sizeKey, weights] of Object.entries(lightTree)) {
  if (!/^text-/.test(sizeKey) || !weights || typeof weights !== 'object')
    continue
  for (const [weightKey, node] of Object.entries(weights)) {
    if (node?.$type !== 'typography') continue
    const v = node.$value
    typo.push({
      name: `${sizeKey.replace(/^text-/, '')}-${weightKey}`,
      fontSize: deref(v.fontSize),
      lineHeight: deref(v.lineHeight),
      letterSpacing: deref(v.letterSpacing),
      fontWeight: WEIGHT[deref(v.fontWeight)] ?? 400,
    })
  }
}

out.push('@theme {')
out.push('  /* Tailwind 기본 text-* 스케일을 지운다. */')
out.push('  /* 디자인 시스템에 없는 글자 크기는 클래스가 생성되지 않는다. */')
out.push('  --text-*: initial;')
out.push('')
for (const t of typo) {
  out.push(`  --text-${t.name}: ${t.fontSize}px;`)
  out.push(`  --text-${t.name}--line-height: ${t.lineHeight}px;`)
  out.push(`  --text-${t.name}--letter-spacing: ${t.letterSpacing}px;`)
  out.push(`  --text-${t.name}--font-weight: ${t.fontWeight};`)
}
out.push('}')
out.push('')

// --- 스페이싱 / 라운딩 ---
const scalar = (set) =>
  Object.values(raw[set] ?? {}).flatMap((group) =>
    Object.entries(group).map(([k, v]) => [k, v.$value]),
  )

const spacing = scalar('[DS] Spacing/Value').map(([, v]) => Number(v))
const radius = scalar('[DS] Radius/Value')

// 디자인 스케일이 Tailwind 의 4px 스텝 위에 그대로 올라가는지 확인한다.
// 올라가지 않으면 p-5 같은 숫자 클래스가 디자인 값과 어긋나므로 빌드를 세운다.
const BASE = 4
const offGrid = spacing.filter((v) => ((v / BASE) * 2) % 1 !== 0)
if (offGrid.length) {
  throw new Error(
    `스페이싱 토큰이 ${BASE}px 스텝(0.5 단위)에 맞지 않습니다: ${offGrid.join(', ')}`,
  )
}

out.push('@theme {')
out.push(`  /* 스페이싱 디자인 스케일(${spacing.join(', ')})이 */`)
out.push(
  `  /* Tailwind 의 ${BASE}px 스텝과 일치해서 기준값만 내려받는다. p-5 = 20px. */`,
)
out.push(`  --spacing: ${BASE}px;`)
out.push('')
out.push(
  '  /* Tailwind 기본 radius 는 같은 이름에 다른 값을 쓴다(md=6px vs 12px). */',
)
out.push('  /* 이름이 겹친 채로 두면 기존 클래스가 조용히 두 배가 된다. */')
out.push('  --radius-*: initial;')
for (const [k, v] of radius) out.push(`  --radius-${k}: ${v}px;`)
out.push('}')
out.push('')

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, out.join('\n'))
fs.rmSync(TMP, { recursive: true, force: true })

console.log(
  `${OUT} 생성: palette ${palette.length}, semantic ${semantic.length}, dark ${darkByName.size}, typo ${typo.length}`,
)
