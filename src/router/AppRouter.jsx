import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom';

import PrivateRoute from './PrivateRouter';
// import { LoginPage } from '../pages/auth/LoginPage';
// import { DashboardPage } from '../pages/Dashboard/Dashboardpage';
// import { VerVacaciones } from '../pages/Vacaciones/VerVacaciones';
// import { Solicitudes } from '../pages/Vacaciones/Solicitudes';

import {LoginPage,DashboardPage,VerVacaciones,Solicitudes, FeriadosPage, FilialesPage, PuestosPage, UsuariosPage} from '../pages'
import RoleRoute from './RoleRouter';
import { deleteToken, getUserFromToken, isTokenExpired } from "../services/AuthService";
import { Layout } from '../layouts/MainLayout';
import { useAuthCheck } from '../hooks/useAuthCheck';

export const AppRouter = () => {

  const [user, setuser] = useState(null)
  const [loading, setloading] = useState(true);


  useEffect(() => {
    //validamos si existe token
    const token=localStorage.getItem("token");
    if (token && !isTokenExpired()){
        setuser(getUserFromToken(token));
    } else{
      deleteToken();
      setuser(null);
      console.log("Sesion Expirada, al login");
    }
     
    setloading(false);
  }, []);

  useAuthCheck(user, setuser);

  if (loading) return <div>...Cargando</div>
  return (
    <Routes>
        {/* Si no hay usuario logueado enviara al login */}
        {!user && <Route path='/*' element={<LoginPage setUser={setuser}/>} />}

        {/* Rutas privadas si hay login activo */}

        {
          user && (
            <>
              <Route path='/' element={<PrivateRoute user={user}>
                <Layout user={user}>
                  <DashboardPage user={user}/>
                </Layout>
              </PrivateRoute>}/>

              {/* Acceso para todos */}

              <Route path='/vacaciones/ver' element={
                <PrivateRoute user={user}>
                  <Layout user={user}>
                    <VerVacaciones user={user} />
                  </Layout> 
                </PrivateRoute>}/>

              {/* Acceso a admin y GERENTES */}
              <Route path='/vacaciones/Solicitudes' element={
                <RoleRoute user={user} roles={['ADMIN','GERENCIAL']}>
                  <Layout user={user}>
                    <Solicitudes/>
                  </Layout>
                </RoleRoute>}/>

              {/* Acceso a Talento humano y admins */}
              <Route path='/feriados/FeriadosPage' element={
                <RoleRoute user={user} roles={['ADMIN','TH']}>
                  <Layout user={user}>
                    <FeriadosPage/>
                  </Layout>
                </RoleRoute>}/>

              <Route path='/filiales/FilialesPage' element={
                <RoleRoute user={user} roles={['ADMIN','TH']}>
                  <Layout user={user}>
                    <FilialesPage/>
                  </Layout>
                </RoleRoute>}/>


              <Route path='/puestos/PuestosPage' element={
                <RoleRoute user={user} roles={['ADMIN','TH']}>
                  <Layout user={user}>
                    <PuestosPage/>
                  </Layout>
                </RoleRoute>}/>

                
              <Route path='/usuarios/UsuariosPage' element={
                <RoleRoute user={user} roles={['ADMIN','TH']}>
                  <Layout user={user}>
                    <UsuariosPage/>
                  </Layout>
                </RoleRoute>}/>
              

              {/* Rutas por defecto */}

              <Route path='*' element={<Navigate to='/'/>}/>
            </>
          )}
    </Routes>
  )
}
