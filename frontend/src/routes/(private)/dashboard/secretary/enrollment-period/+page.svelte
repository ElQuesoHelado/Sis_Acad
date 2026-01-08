<script lang="ts">
  import { onMount } from 'svelte';
  import { secretaryService } from '$lib/core/services/secretary.service';
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { CalendarClock, Save, AlertCircle, CheckCircle2 } from "@lucide/svelte";

  let startDate = "";
  let endDate = "";
  let isLoading = true;
  let isSaving = false;
  let message: { type: 'success' | 'error', text: string } | null = null;

  async function loadPeriod() {
    isLoading = true;
    try {
      const period = await secretaryService.getEnrollmentPeriod();
      if (period.startDate) startDate = new Date(period.startDate).toISOString().slice(0, 16);
      if (period.endDate) endDate = new Date(period.endDate).toISOString().slice(0, 16);
    } catch (error) {
      console.error("Error al cargar periodo:", error);
    } finally {
      isLoading = false;
    }
  }

  async function handleSave() {
    if (!startDate || !endDate) {
        message = { type: 'error', text: 'Debes seleccionar ambas fechas.' };
        return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
        message = { type: 'error', text: 'La fecha de fin debe ser posterior a la de inicio.' };
        return;
    }

    isSaving = true;
    message = null;

    try {
      await secretaryService.setEnrollmentPeriod({
        period: {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        }
      });
      message = { type: 'success', text: 'Periodo de matrícula actualizado correctamente.' };
    } catch (error) {
      message = { type: 'error', text: 'Error al guardar el periodo.' };
    } finally {
      isSaving = false;
    }
  }

  onMount(loadPeriod);
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <div>
    <h2 class="text-3xl font-bold tracking-tight">Periodo de Matrícula</h2>
    <p class="text-muted-foreground">Define el rango de fechas para la inscripción de laboratorios.</p>
  </div>

  <Card.Root>
    <Card.Header>
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary/10 rounded-lg text-primary">
          <CalendarClock class="h-6 w-6" />
        </div>
        <div>
          <Card.Title>Configuración del Periodo</Card.Title>
          <Card.Description>Los estudiantes solo podrán inscribirse dentro de estas fechas.</Card.Description>
        </div>
      </div>
    </Card.Header>
    <Card.Content class="space-y-6">
      
      {#if message}
        <div class={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {#if message.type === 'success'}
            <CheckCircle2 class="h-5 w-5" />
          {:else}
            <AlertCircle class="h-5 w-5" />
          {/if}
          <p class="text-sm font-medium">{message.text}</p>
        </div>
      {/if}

      <div class="grid gap-6 md:grid-cols-2">
        <div class="grid gap-2">
          <Label for="start">Fecha de Inicio</Label>
          <Input 
            id="start" 
            type="datetime-local" 
            bind:value={startDate} 
            class="w-full"
          />
        </div>
        <div class="grid gap-2">
          <Label for="end">Fecha de Fin</Label>
          <Input 
            id="end" 
            type="datetime-local" 
            bind:value={endDate} 
            class="w-full"
          />
        </div>
      </div>

      <div class="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground">
        <p><strong>Nota:</strong> Si las fechas están vacías o el periodo actual está fuera del rango, el sistema bloqueará automáticamente las nuevas inscripciones.</p>
      </div>

    </Card.Content>
    <Card.Footer class="justify-end border-t pt-6">
      <Button onclick={handleSave} disabled={isSaving || isLoading}>
        {#if isSaving}
          <span class="mr-2 animate-spin">⏳</span>
        {:else}
          <Save class="mr-2 h-4 w-4" />
        {/if}
        Guardar Configuración
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
