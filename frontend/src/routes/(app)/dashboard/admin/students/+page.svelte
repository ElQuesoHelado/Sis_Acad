<script>
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	// import { StudentService } from '$lib/core/services';
	import { Plus } from '@lucide/svelte';

	// const studentsPromise = StudentService.getAllStudents();
</script>

<div class="mb-4 flex items-center justify-between">
	<h1 class="text-2xl font-bold">Gestión de Estudiantes</h1>
	<Button href={resolve('/dashboard/admin/students/new')}>
		<Plus class="mr-2 h-4 w-4" />Agregar Estudiante
	</Button>
</div>
