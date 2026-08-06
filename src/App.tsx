import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/app/router'
import { UserProvider } from '@/contexts/UserContext'
import { queryClient } from '@/lib/queryClient'

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </QueryClientProvider>
  )
}

export default App
