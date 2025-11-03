type HomePageProps = Record<string, never>;

const HomePage = ({}: HomePageProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="text-center">
        <h1 className="text-header1 text-primary">Quizly</h1>
        <p className="mt-4 text-body-medium text-gray-600">
          퀴즐리 프로젝트에 오신 것을 환영합니다
        </p>
      </div>
    </div>
  );
};

export default HomePage;
