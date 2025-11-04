<script lang="ts">
	import { StudentService } from '$lib/core/services';
	import type { CreateUserRequest } from '$lib/core/services/types';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import CreateStudentForm from '$lib/components/features/CreateStudentForm.svelte';
	import { preventDefault } from '$lib/core/utils/events';
	let studentData = $state<CreateUserRequest>({
		name: '',
		surname: '',
		email: '',
		password: '',
		birthdate: '',
		status: true
	});

	async function handleSubmit() {
		if (
			!studentData.name ||
			!studentData.email ||
			!studentData.password ||
			!studentData.birthdate
		) {
			toast.error('Por favor, completa todos los campos obligatorios.');
			return;
		}

		try {
			await StudentService.createStudent(studentData);
			toast.success('Estudiante creado exitosamente');
			goto('/dashboard/admin/students');
		} catch (error: any) {
			toast.error(`Error al crear estudiante: ${error.message}`);
		}
	}
</script>

<svelte:head>
	<title>Crear Estudiante</title>
</svelte:head>

<form onsubmit={preventDefault(handleSubmit)} class="justify-items-center pt-6">
	<CreateStudentForm bind:data={studentData} />
</form>
