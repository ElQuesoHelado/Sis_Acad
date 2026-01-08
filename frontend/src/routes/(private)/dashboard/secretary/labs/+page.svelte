<script lang="ts">
  import { onMount } from 'svelte';
  import { secretaryService, CourseSummary } from '$lib/core/services/secretary.service';
  import type { LabGroup, AdminUserListEntry } from '$lib/core/domain/admin.types';
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Plus, FlaskConical, Loader2 } from "@lucide/svelte";
  import * as Select from "$lib/components/ui/select";
  
  let labs: LabGroup[] = [];
  let teachers: AdminUserListEntry[] = [];
  let courses: CourseSummary[] = [];
  let isLoading = true;
  let isSubmitting = false;
  let isSheetOpen = false;

  // Form Data
  let selectedCourseId = "";
  let selectedProfessorId = "";
  let groupLetter = "";
  let capacity = 20;

  async function loadData() {
    isLoading = true;
    try {
      const [labsData, teachersData, coursesData] = await Promise.all([
        secretaryService.getLabs(),
        secretaryService.getTeachers(),
        secretaryService.getCourses()
      ]);
      labs = labsData;
      teachers = teachersData;
      courses = coursesData;
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      isLoading = false;
    }
  }

  async function handleCreateLab() {
    if (!selectedCourseId || !selectedProfessorId || !groupLetter) return;
    
    isSubmitting = true;
    try {
      await secretaryService.createLab({
        courseId: selectedCourseId,
        professorId: selectedProfessorId,
        groupLetter: groupLetter.toUpperCase(),
        capacity: Number(capacity)
      });
      isSheetOpen = false;
      resetForm();
      await loadData(); // Recargar tabla
    } catch (error) {
      console.error("Error creando laboratorio:", error);
      alert("Error al crear el laboratorio");
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    selectedCourseId = "";
    selectedProfessorId = "";
    groupLetter = "";
    capacity = 20;
  }

  // Helpers para mostrar nombres en la tabla
  $: getCourseName = (id: string) => courses.find(c => c.id === id)?.name || 'Desconocido';
  $: getTeacherName = (id: string) => {
    const t = teachers.find(u => u.id === id);
    return t ? `${t.name} ${t.surname}` : 'Desconocido';
  };

  onMount(loadData);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-3xl font-bold tracking-tight">Gestión de Laboratorios</h2>
      <p class="text-muted-foreground">Administra los grupos de prácticas y asigna docentes.</p>
    </div>
    
    <Sheet.Root bind:open={isSheetOpen}>
      <Sheet.Trigger asChild let:builder>
        <Button builders={[builder]}>
          <Plus class="mr-2 h-4 w-4" />
          Nuevo Laboratorio
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="right" class="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>Crear Grupo de Laboratorio</Sheet.Title>
          <Sheet.Description>
            Configura un nuevo grupo práctico para una asignatura.
          </Sheet.Description>
        </Sheet.Header>
        
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label>Asignatura</Label>
            <Select.Root portal={null} onSelectedChange={(v) => v && (selectedCourseId = v.value as string)}>
              <Select.Trigger>
                <Select.Value placeholder="Seleccionar asignatura" />
              </Select.Trigger>
              <Select.Content>
                {#each courses as course}
                  <Select.Item value={course.id} label={course.name}>
                    {course.code} - {course.name}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <div class="grid gap-2">
            <Label>Docente Encargado</Label>
            <Select.Root portal={null} onSelectedChange={(v) => v && (selectedProfessorId = v.value as string)}>
              <Select.Trigger>
                <Select.Value placeholder="Seleccionar docente" />
              </Select.Trigger>
              <Select.Content>
                {#each teachers as teacher}
                  <Select.Item value={teacher.id} label={`${teacher.name} ${teacher.surname}`}>
                    {teacher.name} {teacher.surname}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="group">Grupo (Letra)</Label>
              <Input id="group" bind:value={groupLetter} maxlength={1} placeholder="A" />
            </div>
            <div class="grid gap-2">
              <Label for="capacity">Capacidad</Label>
              <Input id="capacity" type="number" bind:value={capacity} min="1" max="50" />
            </div>
          </div>
        </div>

        <Sheet.Footer>
          <Button disabled={isSubmitting} onclick={handleCreateLab}>
            {#if isSubmitting}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {/if}
            Crear Grupo
          </Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  </div>

  <Card.Root>
    <Card.Content class="p-0">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Asignatura</Table.Head>
            <Table.Head>Grupo</Table.Head>
            <Table.Head>Docente</Table.Head>
            <Table.Head class="text-center">Capacidad</Table.Head>
            <Table.Head class="text-center">Inscritos</Table.Head>
            <Table.Head class="text-right">Estado</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if isLoading}
            <Table.Row>
              <Table.Cell colspan={6} class="h-24 text-center">
                <Loader2 class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              </Table.Cell>
            </Table.Row>
          {:else if labs.length === 0}
            <Table.Row>
              <Table.Cell colspan={6} class="h-24 text-center text-muted-foreground">
                No hay laboratorios registrados.
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each labs as lab}
              <Table.Row>
                <Table.Cell class="font-medium">
                  <div class="flex items-center gap-2">
                    <div class="rounded-md bg-primary/10 p-2 text-primary">
                      <FlaskConical class="h-4 w-4" />
                    </div>
                    {getCourseName(lab.courseId)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span class="font-mono font-bold">{lab.groupLetter}</span>
                </Table.Cell>
                <Table.Cell>{getTeacherName(lab.professorId)}</Table.Cell>
                <Table.Cell class="text-center">{lab.capacity}</Table.Cell>
                <Table.Cell class="text-center">
                  <span class:text-red-500={lab.currentEnrollment >= lab.capacity}>
                    {lab.currentEnrollment}
                  </span>
                </Table.Cell>
                <Table.Cell class="text-right">
                   {#if lab.currentEnrollment >= lab.capacity}
                     <span class="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Lleno</span>
                   {:else}
                     <span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Disponible</span>
                   {/if}
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </Card.Content>
  </Card.Root>
</div>
