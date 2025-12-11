<script lang="ts">
	import { page } from '$app/stores';
	import { teacherService } from '$lib/core/services';
	import type { AccreditationDashboard } from '$lib/core/domain/teacher.types';
	
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils/cn';
	
	import { 
		Upload, FileCheck, FileText, Image as ImageIcon, Loader2, ArrowLeft, 
		Download, BarChart3, Info, CheckCircle2, AlertCircle 
	} from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	const groupId = $page.params.groupId;
	let data = $state<AccreditationDashboard | null>(null);
	let loading = $state(true);
	let uploadingState = $state<string | null>(null);

	async function loadData() {
		try {
			loading = true;
			data = await teacherService.getAccreditationData(groupId as string);
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	}

	loadData();

	async function handleUpload(event: Event, type: any) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		const file = input.files[0];
		uploadingState = type;
		try {
			await teacherService.uploadEvidence(groupId as string, type, file);
			await loadData();
		} catch (e) { alert('Error al subir'); } 
		finally { uploadingState = null; input.value = ''; }
	}

	function triggerInput(id: string) {
		document.getElementById(id)?.click();
	}

	function getPercentage(count: number, distribution: any[]) {
		const total = distribution.reduce((acc, curr) => acc + curr.count, 0);
		if (total === 0) return 0;
		return Math.round((count / total) * 100);
	}

	
	function parseLabel(fullLabel: string) {
		
		const match = fullLabel.match(/^(.*?)\s*\((.*?)\)$/);
		if (match) {
			return { name: match[1], range: match[2] };
		}
		return { name: fullLabel, range: '' };
	}
</script>

<div class="min-h-screen bg-background/50 pb-20">
	<div class="space-y-8 max-w-7xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
		
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6">
			<div class="space-y-1">
				<nav class="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
					<a href="/dashboard/teacher/accreditation" class="hover:text-primary transition-colors flex items-center gap-1 group">
						<ArrowLeft class="w-3 h-3 group-hover:-translate-x-0.5 transition-transform"/> Volver
					</a>
					<span class="text-border">/</span>
					<span class="text-foreground">Portafolio</span>
				</nav>
				<h1 class="text-3xl font-bold tracking-tight text-foreground">Portafolio de Acreditación</h1>
				<p class="text-muted-foreground text-sm max-w-xl">
					Evidencias de desempeño basadas en las <strong>Notas Finales</strong> del curso.
				</p>
			</div>
			
			{#if data}
				<div class="flex gap-4">
					<div class="bg-card border shadow-sm px-4 py-2 rounded-lg flex flex-col items-end min-w-[140px]">
						<span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Promedio Final</span>
						<span class="text-2xl font-bold text-primary font-mono">{data.stats.classAverage}</span>
					</div>
				</div>
			{/if}
		</div>

		{#if loading}
			<div class="flex flex-col items-center justify-center py-32 gap-6 text-muted-foreground animate-pulse">
				<div class="p-4 bg-muted/50 rounded-full">
					<Loader2 class="animate-spin w-10 h-10 text-primary"/>
				</div>
				<p class="text-sm font-medium">Cargando portafolio...</p>
			</div>
		{:else if data}
			
			<div transition:slide>
				<div class="flex items-center justify-between mb-6">
					<div class="space-y-1">
						<h2 class="text-xl font-semibold tracking-tight flex items-center gap-2">
							<ImageIcon class="w-5 h-5 text-primary"/> Muestras de Desempeño
						</h2>
						<p class="text-xs text-muted-foreground">Sube el examen del alumno que obtuvo esta <strong>Nota Final</strong>.</p>
					</div>
				</div>
				
				<div class="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
					
					{#each [
						{ type: 'low', title: 'Nota Baja', score: data.stats.lowestAverage, color: 'text-red-500', bg: 'bg-red-500/10', border: 'hover:border-red-500/30', desc: 'Mínimo', url: data.evidence.lowUrl },
						{ type: 'avg', title: 'Promedio', score: data.stats.classAverage, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/30', desc: 'Media', url: data.evidence.avgUrl },
						{ type: 'high', title: 'Nota Alta', score: data.stats.highestAverage, color: 'text-green-500', bg: 'bg-green-500/10', border: 'hover:border-green-500/30', desc: 'Máximo', url: data.evidence.highUrl }
					] as item}
						<Card.Root class={cn("group relative overflow-hidden transition-all duration-300 border bg-card hover:shadow-lg hover:-translate-y-1", item.border)}>
							<div class={cn("absolute top-0 left-0 w-1 h-full", item.bg.replace('/10', ''))}></div>
							
							<Card.Header class="pb-2 pl-6 pt-5">
								<div class="flex justify-between items-start">
									<div>
										<Card.Description class="text-[10px] uppercase font-bold tracking-wider opacity-60">{item.desc}</Card.Description>
										<Card.Title class="text-sm font-bold mt-0.5">{item.title}</Card.Title>
									</div>
									<div class={cn("px-2.5 py-1 rounded-md text-xl font-bold font-mono tracking-tighter shadow-sm border border-transparent", item.bg, item.color)}>
										{item.score}
									</div>
								</div>
							</Card.Header>
							
							<Card.Content class="pl-6 pb-4">
								<div class="mt-2 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/5 min-h-[90px] flex flex-col items-center justify-center text-center p-3 transition-colors group-hover:bg-background group-hover:border-muted-foreground/30">
									{#if item.url}
										<div class="space-y-1 animate-in fade-in zoom-in-95">
											<div class="bg-primary/10 p-1.5 rounded-full w-fit mx-auto">
												<FileCheck class="w-4 h-4 text-primary"/>
											</div>
											<p class="text-[10px] font-semibold text-foreground">Archivo Listo</p>
											<a href={item.url} target="_blank" class="text-[10px] text-primary hover:underline flex items-center justify-center gap-1">
												<Download class="w-3 h-3"/> Descargar
											</a>
										</div>
									{:else}
										<div class="space-y-1 opacity-60">
											<Upload class="w-5 h-5 mx-auto mb-1"/>
											<p class="text-[10px] font-medium">Subir PDF/Imagen</p>
										</div>
									{/if}
								</div>
							</Card.Content>

							<Card.Footer class="pt-0 pl-6 pb-5">
								<input type="file" id={`up-${item.type}`} class="hidden" accept="image/*,.pdf" onchange={(e) => handleUpload(e, item.type)} />
								<Button 
									variant="outline" 
									size="sm" 
									class="w-full text-xs h-8 font-normal" 
									disabled={uploadingState === item.type} 
									onclick={() => triggerInput(`up-${item.type}`)}
								>
									{#if uploadingState === item.type} <Loader2 class="w-3 h-3 animate-spin mr-2"/> ... {:else} {item.url ? 'Cambiar' : 'Seleccionar'} {/if}
								</Button>
							</Card.Footer>
						</Card.Root>
					{/each}

					<Card.Root class="group border bg-gradient-to-br from-card to-muted/20 hover:shadow-lg hover:-translate-y-1 transition-all">
						<Card.Header class="pb-2 pt-5">
							<div class="flex justify-between items-start">
								<div>
									<Card.Description class="text-[10px] uppercase font-bold tracking-wider opacity-60">Documentación</Card.Description>
									<Card.Title class="text-sm font-bold mt-0.5">Sílabo del Curso</Card.Title>
								</div>
								<FileText class="w-5 h-5 text-muted-foreground/50"/>
							</div>
						</Card.Header>
						<Card.Content>
							<div class="mt-4 flex flex-col items-center justify-center min-h-[90px] text-center gap-2">
								{#if data.evidence.syllabusUrl}
									<div class="flex items-center gap-2 text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
										<CheckCircle2 class="w-3 h-3"/> PDF Activo
									</div>
									<a href={data.evidence.syllabusUrl} target="_blank" class="text-[10px] text-muted-foreground hover:text-primary transition-colors underline decoration-dotted">
										Ver Documento
									</a>
								{:else}
									<p class="text-xs text-muted-foreground max-w-[150px] italic">
										Falta subir el sílabo oficial.
									</p>
								{/if}
							</div>
						</Card.Content>
						<Card.Footer class="pb-5">
							<input type="file" id="up-syll" class="hidden" accept=".pdf" onchange={(e) => handleUpload(e, 'syllabus')} />
							<Button variant="default" size="sm" class="w-full text-xs h-8" disabled={uploadingState === 'syllabus'} onclick={() => triggerInput('up-syll')}>
								{uploadingState === 'syllabus' ? '...' : (data.evidence.syllabusUrl ? 'Actualizar PDF' : 'Subir Sílabo')}
							</Button>
						</Card.Footer>
					</Card.Root>

				</div>
			</div>

			<Separator class="my-10"/>

			<div transition:slide>
				<div class="flex items-center justify-between mb-6">
					<div class="space-y-1">
						<h2 class="text-xl font-semibold tracking-tight flex items-center gap-2">
							<BarChart3 class="w-5 h-5 text-primary"/> Análisis por Evaluación
						</h2>
						<p class="text-xs text-muted-foreground">Distribución detallada de notas para detectar puntos de mejora.</p>
					</div>
				</div>

				{#if data.evaluations.length === 0}
					<div class="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/5 text-muted-foreground">
						<Info class="w-8 h-8 mb-2 opacity-20"/>
						<p class="text-sm">Aún no hay notas registradas para este curso.</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{#each data.evaluations as evaluation}
							<Card.Root class="hover:border-primary/20 transition-colors shadow-sm">
								<Card.Header class="pb-2 border-b bg-muted/5 flex flex-row items-center justify-between py-3">
									<Card.Title class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
										{evaluation.name}
									</Card.Title>
									<Badge variant="outline" class="text-[9px] font-mono h-5 bg-background">
										{evaluation.distribution.reduce((a, b) => a + b.count, 0)} Alumnos
									</Badge>
								</Card.Header>
								<Card.Content class="p-6 pt-8">
									<div class="flex items-end justify-between h-40 gap-3">
										{#each evaluation.distribution as item}
											{@const pct = getPercentage(item.count, evaluation.distribution)}
											{@const labelInfo = parseLabel(item.label)} <div class="flex flex-col items-center justify-end h-full w-full gap-2 group relative">
												
												<div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-20 pointer-events-none">
													<div class="bg-foreground text-background text-[10px] px-2 py-1.5 rounded shadow-xl flex flex-col items-center whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-foreground">
														<span class="font-bold">{item.count}</span>
														<span class="font-normal opacity-80">{pct}%</span>
													</div>
												</div>

												<div class="relative w-full rounded-t-sm h-full flex items-end bg-muted/10 overflow-hidden">
													<div 
														class="w-full transition-all duration-1000 ease-out rounded-t-sm hover:opacity-80"
														style={`height: ${pct > 4 ? pct : 4}%; background-color: ${item.color};`}
													></div>
												</div>

												<div class="text-center w-full">
													<p class="text-[10px] font-bold text-foreground leading-tight truncate px-0.5">
														{labelInfo.name}
													</p>
													<p class="text-[9px] text-muted-foreground font-mono mt-0.5">
														{labelInfo.range}
													</p>
												</div>
											</div>
										{/each}
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				{/if}
			</div>

		{/if}
	</div>
</div>
