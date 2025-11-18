import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TestListPage from "./features/test-list/pages/TestListPage.jsx";
import {QueryClientWrapper} from "./app/QueryClientWrapper.jsx";

createRoot(document.getElementById('root')).render(
  <QueryClientWrapper>
    <TestListPage />
  </QueryClientWrapper>,
)
