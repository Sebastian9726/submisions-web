import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  transform(value: string | Date | null): string {
    if (!value) {
      return '';
    }

    try {
      // Convertir valor a fecha asegurando que conserve la información de hora
      let date: Date;
      
      if (typeof value === 'string') {
        // Para strings ISO, parseamos manualmente para asegurar que la hora se mantiene
        date = new Date(value);
        console.log('Fecha original (string):', value);
        console.log('Fecha convertida:', date);
        console.log('Hora de la fecha:', date.getHours(), date.getMinutes());
      } else {
        date = value;
        console.log('Fecha original (objeto):', date);
        console.log('Hora de la fecha:', date.getHours(), date.getMinutes());
      }
      
      // Comprobar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', value);
        return String(value);
      }

      // Formato: "Oct 6, 02:38 AM" con todas las partes explícitas
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC' // Usar UTC para evitar problemas de zona horaria
      };

      const formatted = date.toLocaleString('en-US', options);
      console.log('Fecha formateada:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error al formatear fecha:', error, value);
      return String(value);
    }
  }
} 