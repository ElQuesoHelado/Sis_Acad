<script lang="ts">
	import { teacherService } from '$lib/core/services';

	interface ScheduleItem {
		courseName: string;
		groupType: string;
		groupLetter: string;
		day: string;
		startTime: string;
		endTime: string;
		classroomName: string;
	}

	let schedule: ScheduleItem[] = [];
	let selectedClass: ScheduleItem | null = null;

	async function loadSchedule() {
		try {
			schedule = await teacherService.getScheduleBySemester('2024-I');
		} catch (error) {
			console.error('Error loading schedule:', error);
		}
	}

	loadSchedule();

	const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

	// Extraer todos los horarios únicos de inicio de las clases y ordenarlos
	$: timeSlots = schedule
		.map((item) => ({ start: item.startTime, end: item.endTime }))
		.filter(
			(time, index, array) =>
				array.findIndex((t) => t.start === time.start && t.end === time.end) === index
		)
		.sort((a, b) => a.start.localeCompare(b.start));

	function getClass(day: string, startTime: string, endTime: string): ScheduleItem | null {
		return (
			schedule.find(
				(item) => item.day === day && item.startTime === startTime && item.endTime === endTime
			) || null
		);
	}

	function hasClassAtTime(day: string, startTime: string, endTime: string): boolean {
		return schedule.some(
			(item) => item.day === day && item.startTime === startTime && item.endTime === endTime
		);
	}
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<h1 class="mb-8 text-center text-3xl font-bold text-gray-800">Horario de Clases</h1>

	<div class="overflow-hidden rounded-lg bg-white shadow-lg">
		<div class="overflow-x-auto">
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th class="border border-gray-200 bg-gray-100 p-4 font-semibold text-gray-700"
							>Horario</th
						>
						{#each days as day}
							<th
								class="border border-gray-200 bg-gray-100 p-4 text-center font-semibold text-gray-700"
							>
								{day}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each timeSlots as timeSlot}
						<tr>
							<td
								class="border border-gray-200 bg-gray-50 p-3 text-center text-sm font-medium text-gray-600"
							>
								<div>{timeSlot.start}</div>
								<div class="text-xs text-gray-500">a</div>
								<div>{timeSlot.end}</div>
							</td>
							{#each days as day}
								{#if hasClassAtTime(day, timeSlot.start, timeSlot.end)}
									{@const classItem = getClass(day, timeSlot.start, timeSlot.end)}
									{#if classItem}
										<td
											class="cursor-pointer border border-gray-200 p-3 transition-all duration-200 hover:shadow-md {classItem.groupType ===
											'Teoria'
												? 'bg-blue-100 hover:bg-blue-200'
												: 'bg-green-100 hover:bg-green-200'}"
											on:click={() => (selectedClass = classItem)}
										>
											<div class="mb-1 text-sm font-semibold text-gray-800">
												{classItem.courseName}
											</div>
											<div class="mb-1 text-xs text-gray-600">
												📚 {classItem.classroomName}
											</div>
											<div class="mt-2 border-t border-gray-300 pt-2 text-xs text-gray-400">
												{classItem.groupType === 'Teoria' ? 'T' : 'L'}
												{classItem.groupLetter}
											</div>
										</td>
									{:else}
										<td class="border border-gray-200 bg-white p-3"></td>
									{/if}
								{:else}
									<td class="border border-gray-200 bg-white p-3"></td>
								{/if}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Detalles de la clase seleccionada -->
	{#if selectedClass}
		<div class="mx-auto mt-8 max-w-2xl rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-2xl font-bold text-gray-800">Detalles de la Clase</h2>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<h3 class="font-semibold text-gray-700">Curso:</h3>
					<p class="text-gray-900">{selectedClass.courseName}</p>
				</div>

				<div>
					<h3 class="font-semibold text-gray-700">Tipo:</h3>
					<p class="text-gray-900">{selectedClass.groupType} {selectedClass.groupLetter}</p>
				</div>

				<div>
					<h3 class="font-semibold text-gray-700">Día:</h3>
					<p class="text-gray-900">{selectedClass.day}</p>
				</div>

				<div>
					<h3 class="font-semibold text-gray-700">Horario:</h3>
					<p class="text-gray-900">{selectedClass.startTime} - {selectedClass.endTime}</p>
				</div>

				<div>
					<h3 class="font-semibold text-gray-700">Aula:</h3>
					<p class="text-gray-900">{selectedClass.classroomName}</p>
				</div>
			</div>

			<button
				on:click={() => (selectedClass = null)}
				class="mt-6 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600"
			>
				Cerrar
			</button>
		</div>
	{/if}

	<!-- Leyenda -->
	<div class="mt-6 flex justify-center gap-6 text-sm">
		<div class="flex items-center gap-2">
			<div class="h-4 w-4 rounded border border-blue-300 bg-blue-100"></div>
			<span class="text-gray-700">Teoría</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="h-4 w-4 rounded border border-green-300 bg-green-100"></div>
			<span class="text-gray-700">Laboratorio</span>
		</div>
	</div>
</div>
