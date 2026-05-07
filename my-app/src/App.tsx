import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/shared/PrivateRoute";
import MainLayout from "./components/layout/MainLayout";

// import ModelList from './pages/public/models/ModelList'; // Keep original for reference or remove if fully replaced
import ExampleList from "./pages/public/examples/ExampleList";
import ExerciseList from "./pages/public/exercises/ExerciseList";
import Home from "./pages/public/home/Home";
import ModelsListHome from "./pages/public/home/ModelsListHome";
import MainModelDetail from "./pages/public/model-detail/MainModelDetail";
import "./App.css";

import AdminManagementList from "./pages/admin/Dashboard/admin/AdminManagementList";
import RoleList from "./pages/admin/Dashboard/roles/RoleList";
import AddRole from "./pages/admin/Dashboard/roles/AddRole";
import ThreeDModelList from "./pages/admin/Dashboard/3d-models/3DModelList";
import AddEdit3DModel from "./pages/admin/Dashboard/3d-models/AddEdit3DModel";
import UserList from "./pages/admin/Dashboard/users/UserList";
import UserDetail from "./pages/admin/Dashboard/users/UserDetail";
import TheoryList from "./pages/admin/Dashboard/theories/TheoryList";
import AddEditTheory from "./pages/admin/Dashboard/theories/AddEditTheory";
import ExampleManagementList from "./pages/admin/Dashboard/examples/ExampleList";
import AddEditExample from "./pages/admin/Dashboard/examples/AddEditExample";
import ExerciseManagementList from "./pages/admin/Dashboard/exercises/ExerciseList";
import AddEditExercise from "./pages/admin/Dashboard/exercises/AddEditExercise";
import MainDashboard from "./pages/admin/Dashboard/MainDashboard";
import DashboardOverview from "./pages/admin/Dashboard/DashboardOverview";
import LoginPage from "./pages/auth/auth/LoginPage";
import ForgotPage from "./pages/auth/auth/ForgotPage";
import OtpPage from "./pages/auth/auth/OtpPage";
import ResetPage from "./pages/auth/auth/ResetPage";
import RegisterPage from "./pages/auth/auth/RegisterPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public/Main Layout Routes */}
          <Route
            element={
              <MainLayout>
                <Outlet />
              </MainLayout>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<ModelsListHome />} />
            <Route path="/models/:typeName" element={<MainModelDetail />} />

            <Route path="/examples" element={<ExampleList />} />
            <Route path="/exercises" element={<ExerciseList />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPage />} />
            <Route path="otp" element={<OtpPage />} />
            <Route path="reset-password" element={<ResetPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Dashboard Routes (No MainLayout or different layout) */}
          <Route
            element={
              <PrivateRoute
                requiredPermissions={["view_dashboard"]}
              />
            }
          >
            <Route path="/dashboard" element={<MainDashboard />}>
              <Route index element={<DashboardOverview />} />

              <Route element={<PrivateRoute requiredPermissions={["view_admin_list"]} />}>
                <Route path="admins" element={<AdminManagementList />} />
              </Route>
              <Route element={<PrivateRoute requiredPermissions={["view_role_list"]} />}>
                <Route path="roles" element={<RoleList />} />
                <Route path="roles/add" element={<AddRole />} />
                <Route path="roles/:id" element={<AddRole />} />
              </Route>
              <Route element={<PrivateRoute requiredPermissions={["view_user_list"]} />}>
                <Route path="users" element={<UserList />} />
                <Route path="users/:id" element={<UserDetail />} />
              </Route>

              <Route
                element={
                  <PrivateRoute requiredPermissions={["view_model_list"]} />
                }
              >
                <Route path="3d-models" element={<ThreeDModelList />} />
                <Route path="3d-models/add" element={<AddEdit3DModel />} />
                <Route path="3d-models/:typeName" element={<AddEdit3DModel />} />
              </Route>

              <Route
                element={
                  <PrivateRoute
                    requiredPermissions={["view_theory_list"]}
                  />
                }
              >
                <Route path="theory" element={<TheoryList />} />
                <Route path="theory/add" element={<AddEditTheory />} />
                <Route path="theory/:id" element={<AddEditTheory />} />
              </Route>

              <Route
                element={
                  <PrivateRoute
                    requiredPermissions={["view_example_list"]}
                  />
                }
              >
                <Route path="examples" element={<ExampleManagementList />} />
                <Route path="examples/add" element={<AddEditExample />} />
                <Route path="examples/:id" element={<AddEditExample />} />
              </Route>

              <Route
                element={
                  <PrivateRoute
                    requiredPermissions={["view_exercise_list"]}
                  />
                }
              >
                <Route path="exercises" element={<ExerciseManagementList />} />
                <Route path="exercises/add" element={<AddEditExercise />} />
                <Route path="exercises/:id" element={<AddEditExercise />} />
              </Route>


              {/* Add other routes similarly */}
              <Route
                path="*"
                element={<div className="p-6">Module under construction</div>}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
