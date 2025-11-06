<script lang="ts">
  import { onMount } from 'svelte';
  import { studentService } from '$lib/core/services/student.service';

  // Basado en tu DTO real
  type CourseGradeSummary = {
    enrollmentId: string;
    courseName: string;
    professorName: string;
    grades: {
      id: string;
      type: string;
      typeName: string;
      score: number;
    }[];
    average: number | null; // Puede ser null si no hay suficientes datos
    status: 'Aprobado' | 'Desaprobado' | 'En Progreso';
  };

  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Separator } from '$lib/components/ui/separator';
  import { BookOpen, User, GraduationCap, AlertCircle, Loader2, ChevronDown, Award } from '@lucide/svelte';

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
  } from '$lib/components/ui/dropdown-menu';

  let summaries: CourseGradeSummary[] = [];
  let loading = true;
  let error = '';
  let selectedSemester = '2024-I';

  const semesters = [
    '2025-I',
    '2024-II',
    '2024-I',
    '2023-II',
    '2023-I'
  ];

  async function loadGrades() {
    loading = true;
    error = '';
    try {
      summaries = await studentService.getGradesBySemester(selectedSemester);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al cargar las notas';
      summaries = [];
    } finally {
      loading = false;
    }
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'Aprobado':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20';
      case 'Desaprobado':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20';
      case 'En Progreso':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20';
      default:
        return 'bg-primary/10 text-primary border border-primary/20';
    }
  }

  function handleSemesterChange(semester: string) {
    selectedSemester = semester;
    loadGrades();
  }

  // Calcula el promedio general solo de cursos con promedio válido (no null)
  $: coursesWithAverage = summaries.filter(s => s.average !== null && !isNaN(s.average));
  
  $: avgAll = coursesWithAverage.length > 0
    ? (
        coursesWithAverage.reduce((acc, s) => acc + (s.average ?? 0), 0) / coursesWithAverage.length
      ).toFixed(2)
    : '-';

  $: passed = summaries.filter(s => s.status === 'Aprobado').length;
  $: failed = summaries.filter(s => s.status === 'Desaprobado').length;
  $: inProgress = summaries.filter(s => s.status === 'En Progreso').length;

  onMount(() => {
    loadGrades();
  });
</script>

<div class="min-h-screen p-6">
  <div class="max-w-7xl mx-auto space-y-6">

    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Mis Notas</h1>
      <p class="text-muted-foreground">Consulta todas tus calificaciones y promedios del semestre por curso</p>
    </div>

    <!-- Semester Selector -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center gap-4">
          <Label for="semester" class="text-sm font-medium">Semestre:</Label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" class="w-[180px] justify-between">
                {selectedSemester}
                <ChevronDown class="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[180px]">
              {#each semesters as semester}
                <DropdownMenuItem on:click={() => handleSemesterChange(semester)}>
                  {semester}
                </DropdownMenuItem>
              {/each}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>

    <!-- Loading State -->
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <Loader2 class="h-12 w-12 animate-spin text-primary" />
          <p class="text-muted-foreground">Cargando notas...</p>
        </div>
      </div>
    {/if}

    <!-- Error State -->
    {#if error && !loading}
      <Card class="border-destructive/50 bg-destructive/5">
        <CardContent class="pt-6">
          <div class="flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-destructive mb-1">Error al cargar las notas</h3>
              <p class="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    {/if}

    <!-- Course Grades Grid -->
    {#if !loading && !error}
      {#if summaries.length === 0}
        <Card>
          <CardContent class="flex flex-col items-center justify-center py-12">
            <BookOpen class="h-16 w-16 text-muted-foreground mb-4" />
            <h3 class="text-lg font-semibold mb-2">No hay notas registradas</h3>
            <p class="text-muted-foreground text-center">
              No se encontraron notas para el semestre {selectedSemester}
            </p>
          </CardContent>
        </Card>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {#each summaries as summary (summary.enrollmentId)}
            <Card class="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div class="flex items-center justify-between mb-2">
                  <CardTitle class="text-lg">{summary.courseName}</CardTitle>
                  <span class="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold font-mono bg-primary/10 text-primary border border-primary/20">
                    {summary.enrollmentId.slice(-6)}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <User class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span class="text-sm text-muted-foreground">{summary.professorName}</span>
                </div>
              </CardHeader>
              <CardContent class="space-y-3">
                <div>
                  <table class="min-w-full">
                    <thead>
                      <tr>
                        <th class="text-left text-xs font-semibold text-muted-foreground px-2 py-1">Tipo</th>
                        <th class="text-center text-xs font-semibold text-muted-foreground px-2 py-1">Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each summary.grades as grade}
                        <tr>
                          <td class="px-2 py-1 text-sm">{grade.typeName ?? grade.type}</td>
                          <td class="px-2 py-1 text-sm text-center font-medium">
                            {grade.score !== null && grade.score !== undefined ? grade.score : '-'}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>

                <Separator />

                <div class="flex items-center justify-between mt-2">
                  <span class="font-medium">Promedio Final:</span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {summary.average !== null && summary.average !== undefined ? summary.average.toFixed(2) : '-'}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium">Estado:</span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold {statusColor(summary.status)}">
                    {summary.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          {/each}
        </div>

        <!-- Summary Card -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex flex-col sm:flex-row items-center justify-around gap-6">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-lg bg-primary/10">
                  <Award class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Promedio General</p>
                  <p class="text-3xl font-bold">{avgAll}</p>
                </div>
              </div>

              <Separator orientation="vertical" class="hidden sm:block h-16" />

              <div class="flex items-center gap-4">
                <div class="p-3 rounded-lg bg-green-200/40">
                  <GraduationCap class="h-6 w-6 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Aprobados</p>
                  <p class="text-3xl font-bold">{passed}</p>
                </div>
              </div>

              <Separator orientation="vertical" class="hidden sm:block h-16" />

              <div class="flex items-center gap-4">
                <div class="p-3 rounded-lg bg-red-200/40">
                  <GraduationCap class="h-6 w-6 text-red-700 dark:text-red-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Desaprobados</p>
                  <p class="text-3xl font-bold">{failed}</p>
                </div>
              </div>

              {#if inProgress > 0}
                <Separator orientation="vertical" class="hidden sm:block h-16" />

                <div class="flex items-center gap-4">
                  <div class="p-3 rounded-lg bg-blue-200/40">
                    <GraduationCap class="h-6 w-6 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">En Progreso</p>
                    <p class="text-3xl font-bold">{inProgress}</p>
                  </div>
                </div>
              {/if}
            </div>
          </CardContent>
        </Card>
      {/if}
    {/if}
  </div>
</div>