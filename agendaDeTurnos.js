// dejo comentado el anterior ejercicio, como buena práctica no debería dejar código comentado, pero lo hago para distiguir entre lo que hice previamente y las correciones pautadas
//  let turnos = [
//     {id: "1", dia: "Lunes 10", hora: "10:00"},
//     {id: "2", dia: "Lunes 10", hora: "11:00"},
//     {id: "3", dia: "Lunes 10", hora: "12:00"},
//     {id: "4", dia: "Martes 11", hora: "10:00"},
//     {id: "5", dia: "Martes 11", hora: "11:00"},
//     {id: "6", dia: "Martes 11", hora: "12:00"},
//     {id: "7", dia: "Miércoles 12", hora: "10:00"},
//     {id: "8", dia: "Miércoles 12", hora: "11:00"},
//     {id: "9", dia: "Miércoles 12", hora: "12:00"},
//     {id: "10", dia: "Jueves 13", hora: "10:00"},
//     {id: "11", dia: "Jueves 13", hora: "11:00"},
// ];

// En esta entrega modifico el codigo para manipular directamente el HTML en lugar de cargar un array extra y perder performance
let turnosSeleccionados = [];




function seleccionarTurno() {

    // turnos Seleccionados almacena objetos a partir de los eventos de click en los botones de turno
document.querySelectorAll(".turno button").forEach(button => { 
    button.addEventListener("click", () =>{
    const turnoDiv = button.parentElement; // selecciono el div correspondiente al turno completo
    const id = turnoDiv.dataset.id;
    const dia = turnoDiv.dataset.dia;
    const hora = turnoDiv.dataset.hora;

    // primero chequeo si el turno ya fue seleccionado
if(turnosSeleccionados.find(t => t.id === id)) return;

// agrego el turno seleccionado al array de turnos seleccionados
    turnosSeleccionados.push({id, dia, hora});

     // Creo un nuevo div para mostrar el turno confirmado en la sección de confirmados
      const nuevoDiv = document.createElement("div");
      nuevoDiv.innerHTML = `<span>Turno confirmado: ${dia} a las ${hora}</span>`;

      // Agrego al contenedor de confirmados la info del nuevo div creado
      document.getElementById("confirmados").appendChild(nuevoDiv);

    // elimino el turno dinamicamente de la seccion de turnos disponibles
    turnoDiv.remove();
});

});


    




    // while (true) {
    //     let mensaje = "Seleccione un turno:\n";
    //     for (let i = 0; i < turnos.length; i++) {
    //         mensaje += `${turnos[i].id}. ${turnos[i].dia} - ${turnos[i].hora}\n`;
    //     }
    //     let turnoSeleccionado = prompt(mensaje);
    //     if (turnoSeleccionado === null) return null; // Cancela la operación

    //     turnoSeleccionado = turnoSeleccionado.trim();
    //     let turno = turnos.find(t => t.id === turnoSeleccionado);
    //     if (turno) {
    //         turnos.splice(turnos.indexOf(turno), 1); // Elimina el turno reservado
    //         turnosSeleccionados.push(turno); // Agrega el turno a los seleccionados
    //         return `Turno confirmado: ${turno.dia} a las ${turno.hora}`;
    //     } else {
    //         alert("Turno no encontrado. Por favor, seleccione un turno válido.");
    //     }
    // }
}

seleccionarTurno();
// if (resultado) {
//     alert(resultado);
// } else {
//     alert("Operación cancelada.");
// }

