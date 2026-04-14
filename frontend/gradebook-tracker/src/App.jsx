import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext.jsx";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastProvider } from "./shared/toast/ToastContext.jsx";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
