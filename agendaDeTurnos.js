class SimuladorTurnos {
  constructor() {
    this.turnosDisponibles = [];
    this.turnosConfirmados = [];
    this.datosOriginales = [];

    this.inicializar();
    this.configurarEventos();
  }

  // Inicializar la aplicación
  async inicializar() {
    this.cargarTurnosDesdeStorage();
    await this.cargarDatos();
    this.renderizarTurnos();
    this.actualizarEstadisticas();
  }

  async cargarDatos() {
    try {
        const data = await fetch("./turnosDisponibles.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error del servidor " + response.statusText);
                }
                return response.json();
            })
            .then(jsonData => {
                console.log("Datos cargados:", jsonData);
                return jsonData;
            });
            
        this.datosOriginales = data;
        
        if (this.turnosDisponibles.length === 0) {
            this.turnosDisponibles = [...this.datosOriginales];
        }
        
    } catch (error) {
        console.error("Error cargando datos:", error);
        swal("Error", "No se pudieron cargar los datos del sistema", "error");
    }
}
  // Configurar eventos de la interfaz
            configurarEventos() {
                document.getElementById('btn-cargar-turnos').addEventListener('click', () => this.cargarNuevaSemana());
                document.getElementById('btn-ver-turnos').addEventListener('click', () => this.mostrarTodosLosTurnos());
                document.getElementById('btn-limpiar-todo').addEventListener('click', () => this.limpiarTodo());
            }

            // Renderizar todos los turnos
            renderizarTurnos() {
                this.renderizarTurnosDisponibles();
                this.renderizarTurnosConfirmados();
            }

            // Renderizar turnos disponibles
            renderizarTurnosDisponibles() {
                const container = document.getElementById('lista-turnos');
                
                if (this.turnosDisponibles.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div style="font-size: 4rem; margin-bottom: 20px;">📅</div>
                            <h3>No hay turnos disponibles</h3>
                            <p>Carga una nueva semana para ver turnos disponibles</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = '';
                this.turnosDisponibles.forEach(turno => {
                    const turnoElement = this.crearElementoTurno(turno, false);
                    container.appendChild(turnoElement);
                });
            }

            // Renderizar turnos confirmados
            renderizarTurnosConfirmados() {
                const container = document.getElementById('confirmados');
                
                if (this.turnosConfirmados.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div style="font-size: 4rem; margin-bottom: 20px;">📋</div>
                            <h3>No hay turnos confirmados</h3>
                            <p>Los turnos que reserves aparecerán aquí</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = '';
                this.turnosConfirmados.forEach(turno => {
                    const turnoElement = this.crearElementoTurno(turno, true);
                    container.appendChild(turnoElement);
                });
            }

            // Crear elemento HTML para un turno
            crearElementoTurno(turno, esConfirmado) {
                const div = document.createElement('div');
                div.className = `turno ${esConfirmado ? 'turno-confirmado' : ''}`;
                div.dataset.id = turno.id;

                div.innerHTML = `
                    <div class="turno-info">
                        <span><span class="icon-clock"></span>${turno.dia} - ${turno.hora}</span>
                        <div class="turno-doctor">
                            <span class="icon-doctor"></span>${turno.doctor} - ${turno.especialidad}
                        </div>
                    </div>
                    <button class="${esConfirmado ? 'btn-cancel' : ''}" 
                            onclick="simulador.${esConfirmado ? 'cancelarTurno' : 'reservarTurno'}('${turno.id}')">
                        ${esConfirmado ? '<span class="icon-cancel"></span>Cancelar' : '<span class="icon-check"></span>Reservar'}
                    </button>
                `;

                return div;
            }

            // Reservar un turno
            reservarTurno(id) {
                const turno = this.turnosDisponibles.find(t => t.id === id);
                if (!turno) return;

                // Confirmar reserva
                swal({
                    title: "Confirmar Reserva",
                    text: `¿Desea reservar el turno del ${turno.dia} a las ${turno.hora} con ${turno.doctor}?`,
                    icon: "info",
                    buttons: ["Cancelar", "Confirmar"],
                    dangerMode: false,
                })
                .then((confirmado) => {
                    if (confirmado) {
                        // Mover turno de disponibles a confirmados
                        this.turnosDisponibles = this.turnosDisponibles.filter(t => t.id !== id);
                        this.turnosConfirmados.push(turno);
                        
                        // Guardar en storage y actualizar interfaz
                        this.guardarTurnosEnStorage();
                        this.renderizarTurnos();
                        this.actualizarEstadisticas();
                        
                        swal("¡Turno Reservado!", 
                             `Su turno con ${turno.doctor} ha sido confirmado para el ${turno.dia} a las ${turno.hora}`, 
                             "success");
                    }
                });
            }

            // Cancelar un turno
            cancelarTurno(id) {
                const turno = this.turnosConfirmados.find(t => t.id === id);
                if (!turno) return;

                swal({
                    title: "Cancelar Turno",
                    text: `¿Está seguro que desea cancelar el turno del ${turno.dia} a las ${turno.hora}?`,
                    icon: "warning",
                    buttons: ["No", "Sí, cancelar"],
                    dangerMode: true,
                })
                .then((confirmado) => {
                    if (confirmado) {
                        // Mover turno de confirmados a disponibles
                        this.turnosConfirmados = this.turnosConfirmados.filter(t => t.id !== id);
                        this.turnosDisponibles.push(turno);
                        
                        // Ordenar turnos disponibles por día y hora
                        this.turnosDisponibles.sort((a, b) => {
                            if (a.dia !== b.dia) return a.dia.localeCompare(b.dia);
                            return a.hora.localeCompare(b.hora);
                        });
                        
                        // Guardar en storage y actualizar interfaz
                        this.guardarTurnosEnStorage();
                        this.renderizarTurnos();
                        this.actualizarEstadisticas();
                        
                        swal("Turno Cancelado", "El turno ha sido liberado y está disponible nuevamente", "success");
                    }
                });
            }

            // Cargar nueva semana
            cargarNuevaSemana() {
                swal({
                    title: "Nueva Semana",
                    text: "¿Desea cargar una nueva semana? Esto restaurará todos los turnos disponibles.",
                    icon: "info",
                    buttons: ["Cancelar", "Cargar Nueva Semana"],
                })
                .then((confirmado) => {
                    if (confirmado) {
                        this.turnosDisponibles = [...this.datosOriginales];
                        this.turnosConfirmados = [];
                        this.guardarTurnosEnStorage();
                        this.renderizarTurnos();
                        this.actualizarEstadisticas();
                        
                        swal("¡Nueva Semana Cargada!", "Todos los turnos están disponibles nuevamente", "success");
                    }
                });
            }

            // Mostrar información de todos los turnos
            mostrarTodosLosTurnos() {
                const total = this.turnosDisponibles.length + this.turnosConfirmados.length;
                const mensaje = `
                    📊 RESUMEN DE TURNOS:
                    
                    • Turnos disponibles: ${this.turnosDisponibles.length}
                    • Turnos confirmados: ${this.turnosConfirmados.length}
                    • Total de turnos: ${total}
                    
                    ${this.turnosConfirmados.length > 0 ? 
                        '\n🗓️ PRÓXIMOS TURNOS:\n' + 
                        this.turnosConfirmados.map(t => 
                            `• ${t.dia} ${t.hora} - ${t.doctor}`
                        ).join('\n') 
                        : '\nNo tiene turnos confirmados'}
                `;
                
                swal("Estado de Turnos", mensaje, "info");
            }

            // Limpiar todos los datos
            limpiarTodo() {
                swal({
                    title: "¿Está seguro?",
                    text: "Esto eliminará todos los turnos confirmados y reiniciará el sistema",
                    icon: "warning",
                    buttons: ["Cancelar", "Sí, limpiar todo"],
                    dangerMode: true,
                })
                .then((confirmado) => {
                    if (confirmado) {
                        this.turnosDisponibles = [...this.datosOriginales];
                        this.turnosConfirmados = [];
                        this.limpiarStorage();
                        this.renderizarTurnos();
                        this.actualizarEstadisticas();
                        
                        swal("Sistema Limpiado", "Todos los datos han sido eliminados", "success");
                    }
                });
            }

            // Actualizar estadísticas
            actualizarEstadisticas() {
                document.getElementById('stat-disponibles').textContent = this.turnosDisponibles.length;
                document.getElementById('stat-confirmados').textContent = this.turnosConfirmados.length;
                document.getElementById('stat-total').textContent = this.turnosDisponibles.length + this.turnosConfirmados.length;
            }

            // Guardar turnos en localStorage
            guardarTurnosEnStorage() {
                const datos = {
                    disponibles: this.turnosDisponibles,
                    confirmados: this.turnosConfirmados,
                    fechaGuardado: new Date().toISOString()
                };
                window.turnosGuardados = datos;
            }

            // Cargar turnos desde localStorage
            cargarTurnosDesdeStorage() {
                try {
                    const datos = window.turnosGuardados;
                    
                    if (datos) {
                        this.turnosDisponibles = datos.disponibles || [];
                        this.turnosConfirmados = datos.confirmados || [];
                    }
                } catch (error) {
                    // Si hay error al cargar, usar datos por defecto
                    this.turnosDisponibles = [];
                    this.turnosConfirmados = [];
                }
            }

            // Limpiar localStorage
            limpiarStorage() {
                // localStorage.removeItem('turnosMedicos');
                window.turnosGuardados = null;
            }
        }

        // Inicializar el simulador cuando se carga la página
        let simulador;
        document.addEventListener('DOMContentLoaded', () => {
            simulador = new SimuladorTurnos();
        });