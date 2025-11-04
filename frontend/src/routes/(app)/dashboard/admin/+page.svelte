<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<svelte:head>
	<title>Dashboard - Admin</title>
</svelte:head>

<Card.Root>
	<Card.Header>
		<Card.Title>Bienvenido al Panel de Administrador</Card.Title>
		<Card.Description>
			Utiliza el menú lateral para navegar por las diferentes secciones de gestión.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<p>Desde aquí puedes gestionar usuarios, cursos, laboratorios y ver reportes analíticos.</p>
	</Card.Content>
</Card.Root>
