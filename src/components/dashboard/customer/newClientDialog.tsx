import React, { useEffect, useState } from 'react';
import { Cliente } from '@/app/dashboard/customers/page';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';

interface NewClientProps {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
}

const clienteSchema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  ciRuc: z.string().min(1),
  email: z.string().email('Correo inválido').optional(),
  direccion: z.string().min(1, 'Requerido'),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  celular: z.string().min(1, 'Requerido'),
});

export const NewClientDialog = ({ openDialog, setOpenDialog, cliente, setCliente }: NewClientProps) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'warning'>('success');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Cliente>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      ciRuc: cliente.ciRuc ? cliente.ciRuc : '1234',
      email: '',
      direccion: '',
      fechaNacimiento: '',
      celular: '',
      id: '',
    },
  });
  useEffect(() => {
    if (cliente) {
      reset({
        ciRuc: cliente.ciRuc || '',
      });
    }
  }, [cliente, reset]);

  const calcularEdad = (fecha: string): number => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const onSubmit = async (data: Cliente) => {
    try {
      const response = await axiosClient.post('/api/clientes/isla', {
        ruc: data.ciRuc,
        nombre: data.nombres,
        apellidos: data.apellidos,
        email: data.email || 'pruebas@smo.ec',
        direccion: data.direccion,
        fecha_nacimiento: data.fechaNacimiento,
        telefono: '022222222',
        celular: data.celular,
        ciudad_id: 189,
        provincia_id: 19,
        sexo: 1,
        edad: calcularEdad(data.fechaNacimiento),
      });

      const clienteCreado = response.data.cliente;
      setSnackbarType('success');
      setSnackbarMsg('Cliente registrado con éxito');
      setCliente({ ...clienteCreado, ciRuc: clienteCreado.ruc, nombres: clienteCreado.nombre });

      reset();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al conectar con el servidor');
      setSnackbarType('error');
      setSnackbarMsg('Error al crear el cliente');
    } finally {
      setSnackbarOpen(true);
      setTimeout(() => {
        setOpenDialog(false);
      }, 1500);
    }
  };

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
      <DialogTitle>Nuevo Cliente</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="nombres"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombres"
                  fullWidth
                  size="small"
                  error={!!errors.nombres}
                  helperText={errors.nombres?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="apellidos"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Apellidos"
                  fullWidth
                  size="small"
                  error={!!errors.apellidos}
                  helperText={errors.apellidos?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="ciRuc"
              control={control}
              render={({ field }) => <TextField {...field} label="C.I./R.U.C." fullWidth size="small" disabled />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="E-mail"
                  fullWidth
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="direccion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sector"
                  fullWidth
                  size="small"
                  error={!!errors.direccion}
                  helperText={errors.direccion?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="fechaNacimiento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Fecha Nacimiento"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fechaNacimiento}
                  helperText={errors.fechaNacimiento?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="celular"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Celular"
                  fullWidth
                  size="small"
                  error={!!errors.celular}
                  helperText={errors.celular?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)}>
          Guardar
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
