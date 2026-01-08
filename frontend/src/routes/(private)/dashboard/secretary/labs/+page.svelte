<script lang="ts">
  import { onMount } from "svelte";
  import { secretaryService } from "$lib/core/services/secretary.service";
  import type {
    LabGroup,
    AdminUserListEntry,
    CourseSummary
  } from "$lib/core/domain/admin.types";

  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import * as Sheet from "$lib/components/ui/sheet";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";

  import {
    Plus,
    FlaskConical,
    Pencil,
    LoaderCircle
  } from "@lucide/svelte";

  // =====================
  // Estado
  // =====================
  let labs: LabGroup[] = [];
  let teachers: AdminUserListEntry[] = [];
  let courses: CourseSummary[] = [];
  let isLoading = true;

  // Crear
  let isCreateSheetOpen = false;
  let isCreating = false;

  let createForm = {
    courseId: "",
    professorId: "",
    groupLetter: "",
    capacity: 20
  };

  // Editar
  let isEditOpen = false;
  let isUpdating = false;

  let editForm = {
    labId: "",
    currentCapacity: 0,
    newCapacity: 0
  };

  // =====================
  // Carga de datos
  // =====================
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
    } catch (err) {
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  // =====================
  // Crear laboratorio
  // =====================
  async function handleCreateLab() {
    if (!createForm.courseId || !createForm.professorId || !createForm.groupLetter) {
      return;
    }

    isCreating = true;
    try {
      await secretaryService.createLab({
        courseId: createForm.courseId,
        professorId: createForm.professorId,
        groupLetter: createForm.groupLetter.toUpperCase(),
        capacity: Number(createForm.capacity)
      });

      isCreateSheetOpen = false;
      resetCreateForm();
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error al crear el laboratorio");
    } finally {
      isCreating = false;
    }
  }

  function resetCreateForm() {
    createForm = {
      courseId: "",
      professorId: "",
      groupLetter: "",
      capacity: 20
    };
  }

  // =====================
  // Editar capacidad
  // =====================
  function openEditDialog(lab: LabGroup) {
    editForm = {
      labId: lab.id,
      currentCapacity: lab.capacity,
      newCapacity: lab.capacity
    };
    isEditOpen = true;
  }

  async function handleUpdateCapacity() {
    isUpdating = true;
    try {
      await secretaryService.updateLabCapacity(
        editForm.labId,
        Number(editForm.newCapacity)
      );
      isEditOpen = false;
      await loadData();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar la capacidad");
    } finally {
      isUpdating = false;
    }
  }

  // =====================
  // Helpers
  // =====================
  function getCourseInfo(id: string) {
    const c = courses.find(c => c.id === id);
    return c
      ? { name: c.name, code: c.code }
      : { name: "Desconocido", code: "???" };
  }

  function getTeacherName(id: string) {
    const t = teachers.find(t => t.id === id);
    return t ? `${t.name} ${t.surname}` : "Desconocido";
  }

  onMount(loadData);
</script>

<!-- ===================== UI ===================== -->

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-3xl font-bold tracking-tight">
        Gestión de Laboratorios
      </h2>
      <p class="text-muted-foreground">
        Crea grupos y administra los cupos disponibles.
      </p>
    </div>

    <!-- Crear laboratorio -->
    <Sheet.Root bind:open={isCreateSheetOpen}>
      <Sheet.Trigger>
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Nuevo Laboratorio
        </Button>
      </Sheet.Trigger>

      <Sheet.Content side="right" class="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>Crear Grupo de Laboratorio</Sheet.Title>
          <Sheet.Description>
            Asigna un docente y define la capacidad.
          </Sheet.Description>
        </Sheet.Header>

        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label>Asignatura</Label>
            <Select.Root bind:value={createForm.courseId}>
              <Select.Trigger>
                Seleccionar asignatura
              </Select.Trigger>
              <Select.Content>
                {#each courses as course}
                  <Select.Item value={course.id}>
                    <span class="font-mono text-xs mr-2">
                      {course.code}
                    </span>
                    {course.name}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <div class="grid gap-2">
            <Label>Docente</Label>
            <Select.Root bind:value={createForm.professorId}>
              <Select.Trigger>
                Seleccionar docente
              </Select.Trigger>
              <Select.Content>
                {#each teachers as teacher}
                  <Select.Item value={teacher.id}>
                    {teacher.name} {teacher.surname}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label>Grupo</Label>
              <Input
                maxlength={1}
                class="uppercase"
                bind:value={createForm.groupLetter}
              />
            </div>

            <div class="grid gap-2">
              <Label>Capacidad</Label>
              <Input
                type="number"
                min="1"
                max="50"
                bind:value={createForm.capacity}
              />
            </div>
          </div>
        </div>

        <Sheet.Footer>
          <Button onclick={handleCreateLab} disabled={isCreating}>
            {#if isCreating}
              <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
            {/if}
            Crear Grupo
          </Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  </div>

  <!-- Editar capacidad -->
  <Dialog.Root bind:open={isEditOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Modificar Capacidad</Dialog.Title>
        <Dialog.Description>
          Ajusta el número máximo de estudiantes.
        </Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">Actual</Label>
          <span class="col-span-3 font-mono">
            {editForm.currentCapacity}
          </span>
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">Nueva</Label>
          <Input
            type="number"
            min="1"
            max="50"
            class="col-span-3"
            bind:value={editForm.newCapacity}
          />
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => (isEditOpen = false)}>
          Cancelar
        </Button>
        <Button onclick={handleUpdateCapacity} disabled={isUpdating}>
          {#if isUpdating}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
          {/if}
          Guardar Cambios
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Tabla -->
  <Card.Root>
    <Card.Content class="p-0">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Código</Table.Head>
            <Table.Head>Asignatura</Table.Head>
            <Table.Head>Grupo</Table.Head>
            <Table.Head>Docente</Table.Head>
            <Table.Head class="text-center">Cupos</Table.Head>
            <Table.Head class="text-right">Acciones</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {#if isLoading}
            <Table.Row>
              <Table.Cell colspan={6} class="h-24 text-center">
                <LoaderCircle class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
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
              {@const course = getCourseInfo(lab.courseId)}
              <Table.Row>
                <Table.Cell class="font-mono text-muted-foreground">
                  {course.code}
                </Table.Cell>
                <Table.Cell class="font-medium">
                  <div class="flex items-center gap-2">
                    <FlaskConical class="h-4 w-4 text-primary" />
                    {course.name}
                  </div>
                </Table.Cell>
                <Table.Cell>{lab.groupLetter}</Table.Cell>
                <Table.Cell>
                  {getTeacherName(lab.professorId)}
                </Table.Cell>
                <Table.Cell class="text-center">
                  {lab.currentEnrollment} / {lab.capacity}
                </Table.Cell>
                <Table.Cell class="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => openEditDialog(lab)}
                    title="Editar cupos"
                  >
                    <Pencil class="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </Card.Content>
  </Card.Root>
</div>

