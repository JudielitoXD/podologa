"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Servicio = {
  titulo: string;
  desc: string;
};

type Cita = {
  id: number;
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
  created_at: string;
};

type Horario = {
  id: number;
  dia_semana: number;
  nombre_dia: string;
  activo: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [mensaje, setMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // =====================================================
  // CITAS
  // =====================================================

  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [actualizandoCita, setActualizandoCita] = useState<number | null>(
    null
  );

  // =====================================================
  // HORARIOS
  // =====================================================

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [guardandoHorarios, setGuardandoHorarios] = useState(false);

  // =====================================================
  // 1. INICIO
  // =====================================================

  const [frase, setFrase] = useState(
    "Cuidado y bienestar para tus pies"
  );

  const [titulo, setTitulo] = useState(
    "SERVICIO PODOLÓGICO HUSEY"
  );

  const [descripcion, setDescripcion] = useState(
    "Atención podológica profesional para cuidar la salud de tus pies y ayudarte a caminar con mayor comodidad."
  );

  // =====================================================
  // 2. SERVICIOS
  // =====================================================

  const [servicios, setServicios] = useState<Servicio[]>([
    {
      titulo: "Consulta podológica",
      desc: "Evaluación general y atención profesional para el cuidado de tus pies.",
    },
    {
      titulo: "Tratamiento de uñas",
      desc: "Cuidado especializado de las uñas para mantenerlas saludables y en buenas condiciones.",
    },
    {
      titulo: "Cuidado del pie",
      desc: "Atención enfocada en mejorar el bienestar y cuidado general de tus pies.",
    },
    {
      titulo: "Cuidado preventivo",
      desc: "Atención preventiva para mantener una buena salud y apariencia de los pies.",
    },
    {
      titulo: "Tratamiento especializado",
      desc: "Atención personalizada de acuerdo con las necesidades de cada paciente.",
    },
    {
      titulo: "Atención personalizada",
      desc: "Servicio pensado para brindar una atención cómoda, profesional y de confianza.",
    },
  ]);

  // =====================================================
  // 3. NOSOTROS
  // =====================================================

  const [nosotrosTexto, setNosotrosTexto] = useState(
    "En Servicio Podológico Husey nos enfocamos en brindar atención profesional y personalizada para el cuidado de tus pies, buscando siempre ofrecer un servicio de calidad y confianza."
  );

  // =====================================================
  // 4. GALERÍA
  // =====================================================

  const [fotosGaleria, setFotosGaleria] = useState<string[]>([]);

  // =====================================================
  // 5. UBICACIÓN
  // =====================================================

  const [coordenadas, setCoordenadas] = useState(
    "19.480271, -98.818845"
  );

  const [horarioUbicacion, setHorarioUbicacion] = useState(
    "Próximamente agregaremos nuestros horarios."
  );

  // =====================================================
  // 6. CONTACTO
  // =====================================================

  const [whatsapp, setWhatsapp] = useState(
    "525624771365"
  );

  const [telefono, setTelefono] = useState(
    "525624771365"
  );

  // =====================================================
  // MOSTRAR MENSAJE
  // =====================================================

  const mostrarMensajeNotificacion = (txt: string) => {
    setMensaje(txt);

    setTimeout(() => {
      setMensaje("");
    }, 5000);
  };

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "";

    const partes = fecha.split("-");

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // =====================================================
  // FORMATEAR HORA
  // =====================================================

  const formatearHora = (hora: string) => {
    if (!hora) return "";

    const partes = hora.split(":");

    if (partes.length < 2) {
      return hora;
    }

    let horas = Number(partes[0]);
    const minutos = partes[1];

    const periodo = horas >= 12 ? "PM" : "AM";

    horas = horas % 12;

    if (horas === 0) {
      horas = 12;
    }

    return `${String(horas).padStart(2, "0")}:${minutos} ${periodo}`;
  };

  // =====================================================
  // NORMALIZAR HORA
  // =====================================================

  const normalizarHora = (hora: string | null) => {
    if (!hora) return null;

    const partes = hora.split(":");

    if (partes.length < 2) {
      return hora;
    }

    return `${partes[0].padStart(2, "0")}:${partes[1].padStart(
      2,
      "0"
    )}`;
  };

  // =====================================================
  // CARGAR CITAS
  // =====================================================

  const cargarCitas = async () => {
    const supabase = createClient();

    setCargandoCitas(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCargandoCitas(false);
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("citas")
      .select(
        "id, nombre, telefono, servicio, fecha, hora, motivo, estado, created_at"
      )
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) {
      console.error("ERROR AL CARGAR CITAS:", error);

      mostrarMensajeNotificacion(
        `❌ Error al cargar citas: ${error.message}`
      );

      setCargandoCitas(false);
      return;
    }

    setCitas(data || []);
    setCargandoCitas(false);
  };

  // =====================================================
  // CARGAR HORARIOS
  // =====================================================

  const cargarHorarios = async () => {
    const supabase = createClient();

    setCargandoHorarios(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCargandoHorarios(false);
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("horarios")
      .select(
        "id, dia_semana, nombre_dia, activo, hora_inicio, hora_fin"
      )
      .order("dia_semana", { ascending: true });

    if (error) {
      console.error(
        "ERROR AL CARGAR HORARIOS:",
        error
      );

      mostrarMensajeNotificacion(
        `❌ Error al cargar horarios: ${error.message}`
      );

      setCargandoHorarios(false);
      return;
    }

    const horariosNormalizados: Horario[] = (data || []).map(
      (horario) => ({
        ...horario,
        hora_inicio: normalizarHora(horario.hora_inicio),
        hora_fin: normalizarHora(horario.hora_fin),
      })
    );

    setHorarios(horariosNormalizados);
    setCargandoHorarios(false);
  };

  // =====================================================
  // ACTUALIZAR HORARIO EN PANTALLA
  // =====================================================

  const actualizarHorario = (
    id: number,
    cambios: Partial<Horario>
  ) => {
    setHorarios((actuales) =>
      actuales.map((horario) =>
        horario.id === id
          ? {
              ...horario,
              ...cambios,
            }
          : horario
      )
    );
  };

  // =====================================================
  // GUARDAR HORARIOS
  // =====================================================

  const guardarHorarios = async () => {
    if (guardandoHorarios) return;

    const supabase = createClient();

    try {
      setGuardandoHorarios(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // VALIDAR HORARIOS
      for (const horario of horarios) {
        if (horario.activo) {
          if (
            !horario.hora_inicio ||
            !horario.hora_fin
          ) {
            mostrarMensajeNotificacion(
              `❌ Completa el horario de ${horario.nombre_dia}.`
            );

            return;
          }

          const inicio = normalizarHora(
            horario.hora_inicio
          );

          const fin = normalizarHora(
            horario.hora_fin
          );

          if (!inicio || !fin) {
            mostrarMensajeNotificacion(
              `❌ El horario de ${horario.nombre_dia} no es válido.`
            );

            return;
          }

          if (inicio >= fin) {
            mostrarMensajeNotificacion(
              `❌ La hora de inicio debe ser menor que la hora de fin en ${horario.nombre_dia}.`
            );

            return;
          }
        }
      }

      // GUARDAR CADA DÍA
      for (const horario of horarios) {
        const datosHorario = {
          activo: horario.activo,
          hora_inicio: horario.activo
            ? normalizarHora(horario.hora_inicio)
            : null,
          hora_fin: horario.activo
            ? normalizarHora(horario.hora_fin)
            : null,
        };

        console.log(
          `🔥 GUARDANDO ${horario.nombre_dia}:`,
          datosHorario
        );

        const { data, error } = await supabase
          .from("horarios")
          .update(datosHorario)
          .eq("id", horario.id)
          .select();

        if (error) {
          console.error(
            `❌ ERROR AL GUARDAR ${horario.nombre_dia}:`,
            error
          );

          mostrarMensajeNotificacion(
            `❌ Error al guardar ${horario.nombre_dia}: ${error.message}`
          );

          return;
        }

        console.log(
          `✅ ${horario.nombre_dia} GUARDADO:`,
          data
        );
      }

      await cargarHorarios();

      mostrarMensajeNotificacion(
        "✅ ¡Horarios guardados correctamente!"
      );
    } catch (error) {
      console.error(
        "❌ ERROR INESPERADO AL GUARDAR HORARIOS:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al guardar los horarios."
      );
    } finally {
      setGuardandoHorarios(false);
    }
  };

  // =====================================================
  // CAMBIAR ESTADO DE CITA
  // =====================================================

  const cambiarEstadoCita = async (
    citaId: number,
    nuevoEstado: string
  ) => {
    if (actualizandoCita !== null) return;

    const supabase = createClient();

    try {
      setActualizandoCita(citaId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("citas")
        .update({
          estado: nuevoEstado,
        })
        .eq("id", citaId);

      if (error) {
        console.error(
          "ERROR AL ACTUALIZAR CITA:",
          error
        );

        mostrarMensajeNotificacion(
          `❌ No se pudo actualizar la cita: ${error.message}`
        );

        return;
      }

      setCitas((actuales) =>
        actuales.map((cita) =>
          cita.id === citaId
            ? {
                ...cita,
                estado: nuevoEstado,
              }
            : cita
        )
      );

      mostrarMensajeNotificacion(
        nuevoEstado === "confirmada"
          ? "✅ Cita confirmada correctamente."
          : nuevoEstado === "cancelada"
          ? "❌ Cita cancelada."
          : "🟡 Cita marcada como pendiente."
      );
    } catch (error) {
      console.error(
        "ERROR INESPERADO:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al actualizar la cita."
      );
    } finally {
      setActualizandoCita(null);
    }
  };

  // =====================================================
  // ELIMINAR CITA
  // =====================================================

  const eliminarCita = async (citaId: number) => {
    if (actualizandoCita !== null) return;

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    const supabase = createClient();

    try {
      setActualizandoCita(citaId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("citas")
        .delete()
        .eq("id", citaId);

      if (error) {
        console.error(
          "ERROR AL ELIMINAR CITA:",
          error
        );

        mostrarMensajeNotificacion(
          `❌ No se pudo eliminar la cita: ${error.message}`
        );

        return;
      }

      setCitas((actuales) =>
        actuales.filter(
          (cita) => cita.id !== citaId
        )
      );

      mostrarMensajeNotificacion(
        "🗑️ Cita eliminada correctamente."
      );
    } catch (error) {
      console.error(
        "ERROR INESPERADO:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al eliminar la cita."
      );
    } finally {
      setActualizandoCita(null);
    }
  };

  // =====================================================
  // WHATSAPP DE CITA
  // =====================================================

  const contactarPorWhatsApp = (cita: Cita) => {
    const numero = cita.telefono.replace(
      /\D/g,
      ""
    );

    if (!numero) {
      mostrarMensajeNotificacion(
        "❌ El número de teléfono no es válido."
      );
      return;
    }

    const mensajeWhatsApp =
      `Hola ${cita.nombre}, te contactamos de Servicio Podológico Husey respecto a tu solicitud de cita para el ${formatearFecha(
        cita.fecha
      )} a las ${formatearHora(
        cita.hora
      )}.`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(
      mensajeWhatsApp
    )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // CARGAR DATOS DESDE SUPABASE
  // =====================================================

  useEffect(() => {
    const cargarContenido = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("site_content")
        .select(
          "inicio, servicios, nosotros, galeria, ubicacion, contacto"
        )
        .eq("id", 1)
        .single();

      if (error) {
        console.error(
          "ERROR AL CARGAR SUPABASE:",
          error
        );

        mostrarMensajeNotificacion(
          `❌ Error al cargar: ${error.message}`
        );

        setVerificandoSesion(false);
        return;
      }

      if (!data) {
        mostrarMensajeNotificacion(
          "❌ No se encontró el contenido del sitio."
        );

        setVerificandoSesion(false);
        return;
      }

      // INICIO
      if (data.inicio) {
        setTitulo(
          data.inicio.titulo ||
            "SERVICIO PODOLÓGICO HUSEY"
        );

        setFrase(
          data.inicio.frase ||
            "Cuidado y bienestar para tus pies"
        );

        setDescripcion(
          data.inicio.descripcion ||
            "Atención podológica profesional para cuidar la salud de tus pies y ayudarte a caminar con mayor comodidad."
        );
      }

      // SERVICIOS
      if (Array.isArray(data.servicios)) {
        setServicios(data.servicios);
      }

      // NOSOTROS
      if (typeof data.nosotros === "string") {
        setNosotrosTexto(data.nosotros);
      }

      // GALERÍA
      if (Array.isArray(data.galeria)) {
        setFotosGaleria(data.galeria);
      }

      // UBICACIÓN
      if (data.ubicacion) {
        setCoordenadas(
          data.ubicacion.coordenadas ||
            "19.480271, -98.818845"
        );

        setHorarioUbicacion(
          data.ubicacion.horario ||
            "Próximamente agregaremos nuestros horarios."
        );
      }

      // CONTACTO
      if (data.contacto) {
        setWhatsapp(
          data.contacto.whatsapp ||
            "525624771365"
        );

        setTelefono(
          data.contacto.telefono ||
            "525624771365"
        );
      }

      // CITAS
      await cargarCitas();

      // HORARIOS
      await cargarHorarios();

      setVerificandoSesion(false);
    };

    cargarContenido();
  }, [router]);

  // =====================================================
  // GUARDAR TODO EN SUPABASE
  // =====================================================

  const confirmarGuardado = async () => {
    if (guardando) return;

    setGuardando(true);

    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMostrarModal(false);
        router.push("/login");
        return;
      }

      // =================================================
      // VALIDAR HORARIOS
      // =================================================

      for (const horario of horarios) {
        if (horario.activo) {
          if (
            !horario.hora_inicio ||
            !horario.hora_fin
          ) {
            mostrarMensajeNotificacion(
              `❌ Completa el horario de ${horario.nombre_dia}.`
            );

            return;
          }

          const inicio = normalizarHora(
            horario.hora_inicio
          );

          const fin = normalizarHora(
            horario.hora_fin
          );

          if (!inicio || !fin) {
            mostrarMensajeNotificacion(
              `❌ El horario de ${horario.nombre_dia} no es válido.`
            );

            return;
          }

          if (inicio >= fin) {
            mostrarMensajeNotificacion(
              `❌ La hora de inicio debe ser menor que la hora de fin en ${horario.nombre_dia}.`
            );

            return;
          }
        }
      }

      // =================================================
      // GUARDAR SITE CONTENT
      // =================================================

      const datosParaGuardar = {
        inicio: {
          titulo,
          frase,
          descripcion,
        },

        servicios,

        nosotros: nosotrosTexto,

        galeria: fotosGaleria,

        ubicacion: {
          coordenadas,
          horario: horarioUbicacion,
        },

        contacto: {
          whatsapp,
          telefono,
        },

        updated_at: new Date().toISOString(),
      };

      console.log(
        "🔥 DATOS QUE SE VAN A GUARDAR:",
        datosParaGuardar
      );

      const {
        data,
        error,
      } = await supabase
        .from("site_content")
        .update(datosParaGuardar)
        .eq("id", 1)
        .select();

      if (error) {
        console.error(
          "================================"
        );

        console.error(
          "❌ ERROR COMPLETO DE SUPABASE:"
        );

        console.error(error);

        console.error(
          "MENSAJE:",
          error.message
        );

        console.error(
          "DETALLE:",
          error.details
        );

        console.error(
          "HINT:",
          error.hint
        );

        console.error(
          "CÓDIGO:",
          error.code
        );

        console.error(
          "================================"
        );

        mostrarMensajeNotificacion(
          `❌ ${error.message}`
        );

        return;
      }

      console.log(
        "✅ SITE_CONTENT GUARDADO CORRECTAMENTE:",
        data
      );

      // =================================================
      // GUARDAR HORARIOS
      // =================================================

      for (const horario of horarios) {
        const datosHorario = {
          activo: horario.activo,
          hora_inicio: horario.activo
            ? normalizarHora(horario.hora_inicio)
            : null,
          hora_fin: horario.activo
            ? normalizarHora(horario.hora_fin)
            : null,
        };

        console.log(
          `🔥 GUARDANDO HORARIO ${horario.nombre_dia}:`,
          datosHorario
        );

        const {
          data: horarioGuardado,
          error: errorHorario,
        } = await supabase
          .from("horarios")
          .update(datosHorario)
          .eq("id", horario.id)
          .select();

        if (errorHorario) {
          console.error(
            `❌ ERROR AL GUARDAR ${horario.nombre_dia}:`,
            errorHorario
          );

          mostrarMensajeNotificacion(
            `❌ Los demás cambios se guardaron, pero hubo un error con ${horario.nombre_dia}: ${errorHorario.message}`
          );

          return;
        }

        console.log(
          `✅ ${horario.nombre_dia} GUARDADO CORRECTAMENTE:`,
          horarioGuardado
        );
      }

      // =================================================
      // RECARGAR HORARIOS DESDE SUPABASE
      // =================================================

      await cargarHorarios();

      // =================================================
      // FINAL
      // =================================================

      console.log(
        "🎉 TODOS LOS CAMBIOS SE GUARDARON CORRECTAMENTE"
      );

      setMostrarModal(false);

      mostrarMensajeNotificacion(
        "✅ ¡Todos los cambios, incluidos los horarios, se guardaron correctamente!"
      );
    } catch (error) {
      console.error(
        "❌ ERROR INESPERADO AL GUARDAR TODO:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error inesperado al guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  };

  // =====================================================
  // SUBIR FOTO A SUPABASE STORAGE
  // =====================================================

  const subirFotoDispositivo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(
      "🔥 FUNCIÓN DE SUBIDA EJECUTADA"
    );

    const archivos = e.target.files;

    console.log(
      "📁 ARCHIVOS SELECCIONADOS:",
      archivos
    );

    if (!archivos || archivos.length === 0) {
      console.log(
        "⚠️ NO SE SELECCIONÓ NINGÚN ARCHIVO"
      );
      return;
    }

    const archivo = archivos[0];

    console.log(
      "📸 ARCHIVO SELECCIONADO:",
      archivo
    );

    if (!archivo.type.startsWith("image/")) {
      console.error(
        "❌ EL ARCHIVO NO ES UNA IMAGEN:",
        archivo.type
      );

      mostrarMensajeNotificacion(
        "❌ El archivo seleccionado no es una imagen."
      );

      e.target.value = "";
      return;
    }

    const supabase = createClient();

    try {
      setSubiendoFoto(true);

      const {
        data: { user },
        error: errorUsuario,
      } = await supabase.auth.getUser();

      console.log(
        "👤 USUARIO SUPABASE:",
        user
      );

      if (errorUsuario) {
        console.error(
          "❌ ERROR OBTENIENDO USUARIO:",
          errorUsuario
        );

        mostrarMensajeNotificacion(
          `❌ Error de sesión: ${errorUsuario.message}`
        );

        return;
      }

      if (!user) {
        mostrarMensajeNotificacion(
          "❌ Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        router.push("/login");
        return;
      }

      mostrarMensajeNotificacion(
        "⏳ Subiendo imagen..."
      );

      const extension =
        archivo.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const nombreArchivo = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`;

      const {
        data: dataSubida,
        error: errorSubida,
      } = await supabase.storage
        .from("galeria")
        .upload(
          nombreArchivo,
          archivo,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: archivo.type,
          }
        );

      console.log(
        "📤 RESULTADO DE SUBIDA:",
        dataSubida
      );

      if (errorSubida) {
        console.error(
          "❌ ERROR AL SUBIR IMAGEN:",
          errorSubida
        );

        mostrarMensajeNotificacion(
          `❌ Error al subir: ${errorSubida.message}`
        );

        return;
      }

      console.log(
        "✅ IMAGEN SUBIDA CORRECTAMENTE A STORAGE"
      );

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("galeria")
        .getPublicUrl(nombreArchivo);

      console.log(
        "🌐 URL PÚBLICA:",
        publicUrl
      );

      if (!publicUrl) {
        console.error(
          "❌ NO SE OBTUVO URL PÚBLICA"
        );

        mostrarMensajeNotificacion(
          "❌ No se pudo obtener la URL pública."
        );

        await supabase.storage
          .from("galeria")
          .remove([nombreArchivo]);

        return;
      }

      const nuevasFotos = [
        ...fotosGaleria,
        publicUrl,
      ];

      setFotosGaleria(nuevasFotos);

      mostrarMensajeNotificacion(
        "✅ Foto subida correctamente. Ahora guarda los cambios."
      );
    } catch (error) {
      console.error(
        "❌ ERROR INESPERADO AL SUBIR:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error inesperado al subir la imagen."
      );
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  // =====================================================
  // ELIMINAR FOTO
  // =====================================================

  const eliminarFoto = async (i: number) => {
    if (subiendoFoto) return;

    const foto = fotosGaleria[i];

    if (!foto) {
      return;
    }

    const supabase = createClient();

    try {
      console.log(
        "🗑️ INTENTANDO ELIMINAR FOTO:",
        foto
      );

      const url = new URL(foto);

      const partes = url.pathname.split(
        "/storage/v1/object/public/galeria/"
      );

      const nombreArchivo =
        partes.length > 1
          ? decodeURIComponent(partes[1])
          : null;

      console.log(
        "📁 ARCHIVO A ELIMINAR:",
        nombreArchivo
      );

      if (nombreArchivo) {
        const { error } =
          await supabase.storage
            .from("galeria")
            .remove([nombreArchivo]);

        if (error) {
          console.error(
            "❌ ERROR AL ELIMINAR DE STORAGE:",
            error
          );

          mostrarMensajeNotificacion(
            `❌ No se pudo eliminar la imagen: ${error.message}`
          );

          return;
        }

        console.log(
          "✅ ARCHIVO ELIMINADO DE STORAGE"
        );
      }

      const nuevas = fotosGaleria.filter(
        (_, index) => index !== i
      );

      setFotosGaleria(nuevas);

      mostrarMensajeNotificacion(
        "🗑️ Foto eliminada. Guarda los cambios para actualizar la galería."
      );
    } catch (error) {
      console.error(
        "❌ ERROR AL ELIMINAR FOTO:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al eliminar la foto."
      );
    }
  };

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const cerrarSesion = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  // =====================================================
  // CONTADORES DE CITAS
  // =====================================================

  const citasPendientes = citas.filter(
    (cita) => cita.estado === "pendiente"
  ).length;

  const citasConfirmadas = citas.filter(
    (cita) => cita.estado === "confirmada"
  ).length;

  const citasCanceladas = citas.filter(
    (cita) => cita.estado === "cancelada"
  ).length;

  // =====================================================
  // PANTALLA DE VERIFICACIÓN
  // =====================================================

  if (verificandoSesion) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">
            🦶
          </div>

          <p className="text-gray-600 font-semibold">
            Verificando sesión...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900 pb-16"
      style={{
        backgroundImage:
          "url('/fondo1.jpg')",
      }}
    >
      {/* NAVBAR */}

      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-bold text-pink-600"
          >
            HUSEY{" "}
            <span className="text-xs text-gray-500 font-normal">
              | Panel General
            </span>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMostrarModal(true)
              }
              disabled={
                guardando ||
                subiendoFoto
              }
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold transition shadow-md text-sm"
            >
              💾 Guardar todos los cambios
            </button>

            <button
              onClick={cerrarSesion}
              className="px-5 py-2.5 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition shadow-sm text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}

      <div className="max-w-6xl mx-auto px-4 pt-28">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 grid md:grid-cols-4 overflow-hidden min-h-[600px]">

          {/* MENÚ LATERAL */}

          <div className="bg-pink-50/60 p-6 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">

              <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">
                Secciones
              </p>

              {[
                {
                  id: "inicio",
                  label: "🏠 Inicio",
                },
                {
                  id: "servicios",
                  label: "✂️ Servicios",
                },
                {
                  id: "nosotros",
                  label: "👥 Nosotros",
                },
                {
                  id: "galeria",
                  label: "🖼️ Galería",
                },
                {
                  id: "ubicacion",
                  label: "📍 Ubicación",
                },
                {
                  id: "contacto",
                  label: "💬 Contacto",
                },
                {
                  id: "horarios",
                  label: "🕐 Horarios",
                },
                {
                  id: "citas",
                  label: `📅 Citas${
                    citasPendientes > 0
                      ? ` (${citasPendientes})`
                      : ""
                  }`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setSeccionActiva(tab.id)
                  }
                  className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition text-sm ${
                    seccionActiva === tab.id
                      ? "bg-pink-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-pink-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

            </div>

            <button
              onClick={() =>
                setMostrarModal(true)
              }
              disabled={
                guardando ||
                subiendoFoto
              }
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold shadow-md transition text-sm flex items-center justify-center gap-2"
            >
              <span>💾</span>
              Guardar todos los cambios
            </button>
          </div>

          {/* CONTENIDO PRINCIPAL */}

          <div className="md:col-span-3 p-6 sm:p-10 flex flex-col justify-between">

            <div>

              {/* MENSAJE */}

              {mensaje && (
                <div
                  className={`mb-6 p-4 rounded-2xl font-semibold text-center break-words ${
                    mensaje.startsWith("❌")
                      ? "bg-red-100 border border-red-300 text-red-800"
                      : mensaje.startsWith("⏳")
                      ? "bg-yellow-100 border border-yellow-300 text-yellow-800"
                      : "bg-emerald-100 border border-emerald-300 text-emerald-800"
                  }`}
                >
                  {mensaje}
                </div>
              )}

              {/* =====================================================
                  INICIO
              ===================================================== */}

              {seccionActiva === "inicio" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Modificar Inicio
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-6">

                    <div className="space-y-4">

                      <div>
                        <label className="block font-semibold mb-1 text-sm">
                          Frase superior
                        </label>

                        <input
                          type="text"
                          value={frase}
                          onChange={(e) =>
                            setFrase(e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-sm">
                          Título principal
                        </label>

                        <input
                          type="text"
                          value={titulo}
                          onChange={(e) =>
                            setTitulo(e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-sm">
                          Descripción
                        </label>

                        <textarea
                          rows={4}
                          value={descripcion}
                          onChange={(e) =>
                            setDescripcion(e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-sm"
                        />
                      </div>

                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 flex flex-col justify-center text-center">

                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        👁️ Vista Previa (Inicio)
                      </span>

                      <p className="text-pink-600 font-semibold mb-1 text-xs">
                        {frase ||
                          "Frase superior..."}
                      </p>

                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {titulo ||
                          "Título..."}
                      </h3>

                      <p className="text-gray-600 text-xs leading-relaxed">
                        {descripcion ||
                          "Descripción..."}
                      </p>

                    </div>

                  </div>
                </div>
              )}

              {/* =====================================================
                  SERVICIOS
              ===================================================== */}

              {seccionActiva === "servicios" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Modificar Servicios
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-6">

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">

                      {servicios.map(
                        (s, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2"
                          >

                            <input
                              type="text"
                              value={s.titulo}
                              onChange={(e) => {
                                const copy = [
                                  ...servicios,
                                ];

                                copy[idx] = {
                                  ...copy[idx],
                                  titulo:
                                    e.target.value,
                                };

                                setServicios(copy);
                              }}
                              className="w-full font-bold px-3 py-1.5 rounded-xl border border-gray-300 text-sm"
                            />

                            <textarea
                              rows={2}
                              value={s.desc}
                              onChange={(e) => {
                                const copy = [
                                  ...servicios,
                                ];

                                copy[idx] = {
                                  ...copy[idx],
                                  desc:
                                    e.target.value,
                                };

                                setServicios(copy);
                              }}
                              className="w-full text-xs px-3 py-1.5 rounded-xl border border-gray-300 resize-none"
                            />

                          </div>
                        )
                      )}

                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 overflow-y-auto max-h-[400px]">

                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block text-center">
                        👁️ Vista Previa (Servicios)
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {servicios.map(
                          (s, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                            >

                              <h4 className="font-bold text-xs text-pink-600 mb-1">
                                {s.titulo ||
                                  "Título..."}
                              </h4>

                              <p className="text-[11px] text-gray-600 leading-tight">
                                {s.desc ||
                                  "Descripción..."}
                              </p>

                            </div>
                          )
                        )}

                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* =====================================================
                  NOSOTROS
              ===================================================== */}

              {seccionActiva === "nosotros" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Modificar Nosotros
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-6">

                    <div>

                      <label className="block font-semibold mb-1 text-sm">
                        Texto Sobre Nosotros
                      </label>

                      <textarea
                        rows={7}
                        value={nosotrosTexto}
                        onChange={(e) =>
                          setNosotrosTexto(
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-sm"
                      />

                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 flex flex-col justify-center text-center">

                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        👁️ Vista Previa (Nosotros)
                      </span>

                      <p className="text-gray-700 text-xs leading-relaxed italic">
                        "
                        {nosotrosTexto ||
                          "Texto sobre nosotros..."}
                        "
                      </p>

                    </div>

                  </div>
                </div>
              )}

              {/* =====================================================
                  GALERÍA
              ===================================================== */}

              {seccionActiva === "galeria" && (
                <div>

                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Modificar Galería
                  </h2>

                  <div className="mb-6">

                    <label
                      className={`inline-block px-6 py-3 rounded-full ${
                        subiendoFoto
                          ? "bg-pink-300 cursor-not-allowed"
                          : "bg-pink-600 hover:bg-pink-700 cursor-pointer"
                      } text-white font-bold shadow-md transition text-sm`}
                    >
                      {subiendoFoto
                        ? "⏳ Subiendo foto..."
                        : "📷 Elegir foto de la galería del teléfono"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          subirFotoDispositivo
                        }
                        disabled={
                          subiendoFoto
                        }
                        className="hidden"
                      />

                    </label>

                    <p className="text-xs text-gray-500 mt-2">
                      Las imágenes se almacenarán en Supabase Storage.
                    </p>

                  </div>

                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                    👁️ Vista Previa de Imágenes
                  </span>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">

                    {fotosGaleria.map(
                      (foto, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-gray-50 border border-gray-200 rounded-2xl space-y-2"
                        >

                          <img
                            src={foto}
                            alt={`Imagen de galería ${idx + 1}`}
                            className="h-32 w-full object-cover rounded-xl"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              eliminarFoto(idx)
                            }
                            disabled={
                              subiendoFoto
                            }
                            className="w-full py-1.5 bg-red-100 text-red-600 font-bold text-xs rounded-xl hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 transition"
                          >
                            🗑️ Eliminar foto
                          </button>

                        </div>
                      )
                    )}

                  </div>

                  {fotosGaleria.length === 0 && (
                    <p className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-2xl text-sm">
                      No hay imágenes agregadas aún.
                    </p>
                  )}

                </div>
              )}

              {/* =====================================================
                  UBICACIÓN
              ===================================================== */}

              {seccionActiva === "ubicacion" && (
                <div>

                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Modificar Ubicación
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-6">

                    <div className="space-y-4">

                      <div>

                        <label className="block font-semibold mb-1 text-sm">
                          Coordenadas (Lat, Long)
                        </label>

                        <input
                          type="text"
                          value={coordenadas}
                          onChange={(e) =>
                            setCoordenadas(
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                        />

                      </div>

                      <div>

                        <label className="block font-semibold mb-1 text-sm">
                          Horario
                        </label>

                        <input
                          type="text"
                          value={horarioUbicacion}
                          onChange={(e) =>
                            setHorarioUbicacion(
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                        />

                      </div>

                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 flex flex-col justify-center text-center space-y-2">

                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        👁️ Vista Previa (Ubicación)
                      </span>

                      <p className="text-xs text-gray-800 font-semibold">
                        📍 Coordenadas Mapas:
                      </p>

                      <p className="text-xs text-pink-600 font-mono">
                        {coordenadas ||
                          "Coordenadas..."}
                      </p>

                      <p className="text-xs text-gray-800 font-semibold mt-2">
                        🕒 Horario de Atención:
                      </p>

                      <p className="text-xs text-gray-600">
                        {horarioUbicacion ||
                          "Horario..."}
                      </p>

                    </div>

                  </div>
                </div>
              )}

              {/* =====================================================
                  CONTACTO
              ===================================================== */}

              {seccionActiva === "contacto" && (
                <div>

                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Modificar Contacto
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-6">

                    <div className="space-y-4">

                      <div>

                        <label className="block font-semibold mb-1 text-sm">
                          Número de WhatsApp
                        </label>

                        <input
                          type="text"
                          value={whatsapp}
                          onChange={(e) =>
                            setWhatsapp(
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                        />

                      </div>

                      <div>

                        <label className="block font-semibold mb-1 text-sm">
                          Número telefónico
                        </label>

                        <input
                          type="text"
                          value={telefono}
                          onChange={(e) =>
                            setTelefono(
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                        />

                      </div>

                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 flex flex-col justify-center text-center space-y-3">

                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        👁️ Vista Previa (Contacto)
                      </span>

                      <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold">
                        💬 WhatsApp: +
                        {whatsapp || "..."}
                      </div>

                      <div className="inline-block bg-pink-100 text-pink-800 px-4 py-2 rounded-xl text-xs font-bold">
                        📞 Llamar: +
                        {telefono || "..."}
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* =====================================================
                  HORARIOS
              ===================================================== */}

              {seccionActiva === "horarios" && (
                <div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>

                      <h2 className="text-2xl font-bold text-gray-800">
                        Horarios de atención
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Configura qué días trabaja la podóloga y el horario de atención.
                      </p>

                    </div>

                    <button
                      onClick={cargarHorarios}
                      disabled={
                        cargandoHorarios ||
                        guardandoHorarios
                      }
                      className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-bold text-sm transition"
                    >
                      {cargandoHorarios
                        ? "⏳ Cargando..."
                        : "🔄 Actualizar"}
                    </button>

                  </div>

                  {cargandoHorarios ? (
                    <div className="text-center py-12">

                      <div className="text-4xl mb-3">
                        🕐
                      </div>

                      <p className="text-gray-500 font-semibold">
                        Cargando horarios...
                      </p>

                    </div>
                  ) : horarios.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">

                      <div className="text-5xl mb-4">
                        🕐
                      </div>

                      <p className="font-bold text-gray-600">
                        No hay horarios configurados
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        Verifica que la tabla horarios tenga sus 7 días.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {horarios.map(
                        (horario) => (
                          <div
                            key={horario.id}
                            className={`p-4 rounded-2xl border transition ${
                              horario.activo
                                ? "bg-white border-gray-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >

                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                              {/* DÍA */}

                              <div className="lg:w-40 flex items-center gap-3">

                                <label className="relative inline-flex items-center cursor-pointer">

                                  <input
                                    type="checkbox"
                                    checked={
                                      horario.activo
                                    }
                                    onChange={(e) => {
                                      const activo =
                                        e.target.checked;

                                      actualizarHorario(
                                        horario.id,
                                        {
                                          activo,
                                          hora_inicio:
                                            activo
                                              ? horario.hora_inicio ||
                                                "09:00"
                                              : null,
                                          hora_fin:
                                            activo
                                              ? horario.hora_fin ||
                                                "19:00"
                                              : null,
                                        }
                                      );
                                    }}
                                    className="sr-only peer"
                                  />

                                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-pink-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>

                                </label>

                                <div>

                                  <p className="font-bold text-gray-800 text-sm">
                                    {horario.nombre_dia}
                                  </p>

                                  <p
                                    className={`text-xs font-semibold ${
                                      horario.activo
                                        ? "text-emerald-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {horario.activo
                                      ? "🟢 Activo"
                                      : "⚪ Desactivado"}
                                  </p>

                                </div>

                              </div>

                              {/* HORAS */}

                              <div className="flex-1 grid sm:grid-cols-2 gap-3">

                                <div>

                                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Hora de inicio
                                  </label>

                                  <input
                                    type="time"
                                    value={
                                      normalizarHora(
                                        horario.hora_inicio
                                      ) || ""
                                    }
                                    disabled={
                                      !horario.activo
                                    }
                                    onChange={(e) =>
                                      actualizarHorario(
                                        horario.id,
                                        {
                                          hora_inicio:
                                            e.target
                                              .value,
                                        }
                                      )
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                                  />

                                </div>

                                <div>

                                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Hora de fin
                                  </label>

                                  <input
                                    type="time"
                                    value={
                                      normalizarHora(
                                        horario.hora_fin
                                      ) || ""
                                    }
                                    disabled={
                                      !horario.activo
                                    }
                                    onChange={(e) =>
                                      actualizarHorario(
                                        horario.id,
                                        {
                                          hora_fin:
                                            e.target
                                              .value,
                                        }
                                      )
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                                  />

                                </div>

                              </div>

                              {/* RESUMEN */}

                              <div className="lg:w-40 text-center lg:text-right">

                                {horario.activo ? (
                                  <div className="bg-pink-50 border border-pink-100 rounded-xl px-3 py-2">

                                    <p className="text-xs text-pink-500 font-semibold">
                                      Horario
                                    </p>

                                    <p className="text-sm font-bold text-pink-700">
                                      {horario.hora_inicio
                                        ? formatearHora(
                                            horario.hora_inicio
                                          )
                                        : "--"}
                                      {" - "}
                                      {horario.hora_fin
                                        ? formatearHora(
                                            horario.hora_fin
                                          )
                                        : "--"}
                                    </p>

                                  </div>
                                ) : (
                                  <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2">

                                    <p className="text-xs text-gray-400 font-semibold">
                                      Atención
                                    </p>

                                    <p className="text-sm font-bold text-gray-500">
                                      Cerrado
                                    </p>

                                  </div>
                                )}

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                  {horarios.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-1">

                        <p className="text-xs text-blue-700 font-semibold">
                          💡 Importante
                        </p>

                        <p className="text-xs text-blue-600 mt-1">
                          Los días desactivados se mostrarán como cerrados y no tendrán horas disponibles para citas.
                        </p>

                      </div>

                      <button
                        onClick={
                          guardarHorarios
                        }
                        disabled={
                          guardandoHorarios ||
                          cargandoHorarios
                        }
                        className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold shadow-md transition text-sm whitespace-nowrap"
                      >
                        {guardandoHorarios
                          ? "⏳ Guardando..."
                          : "💾 Guardar horarios"}
                      </button>

                    </div>
                  )}

                </div>
              )}

              {/* =====================================================
                  CITAS
              ===================================================== */}

              {seccionActiva === "citas" && (
                <div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>

                      <h2 className="text-2xl font-bold text-gray-800">
                        Citas
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Administra las solicitudes de cita de tus pacientes.
                      </p>

                    </div>

                    <button
                      onClick={cargarCitas}
                      disabled={cargandoCitas}
                      className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-bold text-sm transition"
                    >
                      {cargandoCitas
                        ? "⏳ Cargando..."
                        : "🔄 Actualizar"}
                    </button>

                  </div>

                  {/* CONTADORES */}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                      <p className="text-xs text-gray-500 font-semibold">
                        Total
                      </p>

                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {citas.length}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                      <p className="text-xs text-yellow-700 font-semibold">
                        Pendientes
                      </p>

                      <p className="text-2xl font-bold text-yellow-800 mt-1">
                        {citasPendientes}
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                      <p className="text-xs text-emerald-700 font-semibold">
                        Confirmadas
                      </p>

                      <p className="text-2xl font-bold text-emerald-800 mt-1">
                        {citasConfirmadas}
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <p className="text-xs text-red-700 font-semibold">
                        Canceladas
                      </p>

                      <p className="text-2xl font-bold text-red-800 mt-1">
                        {citasCanceladas}
                      </p>
                    </div>

                  </div>

                  {/* CARGANDO */}

                  {cargandoCitas && (
                    <div className="text-center py-12">

                      <div className="text-4xl mb-3">
                        📅
                      </div>

                      <p className="text-gray-500 font-semibold">
                        Cargando citas...
                      </p>

                    </div>
                  )}

                  {/* SIN CITAS */}

                  {!cargandoCitas &&
                    citas.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">

                        <div className="text-5xl mb-4">
                          📭
                        </div>

                        <p className="font-bold text-gray-600">
                          No hay citas todavía
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          Cuando un paciente solicite una cita aparecerá aquí.
                        </p>

                      </div>
                    )}

                  {/* LISTA DE CITAS */}

                  {!cargandoCitas &&
                    citas.length > 0 && (
                      <div className="space-y-4">

                        {citas.map((cita) => (

                          <div
                            key={cita.id}
                            className="bg-gray-50 border border-gray-200 rounded-3xl p-5 shadow-sm"
                          >

                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                              {/* INFORMACIÓN */}

                              <div className="flex-1">

                                <div className="flex flex-wrap items-center gap-2 mb-3">

                                  <h3 className="text-lg font-bold text-gray-900">
                                    {cita.nombre}
                                  </h3>

                                  {cita.estado ===
                                    "pendiente" && (
                                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                                      🟡 Pendiente
                                    </span>
                                  )}

                                  {cita.estado ===
                                    "confirmada" && (
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                      🟢 Confirmada
                                    </span>
                                  )}

                                  {cita.estado ===
                                    "cancelada" && (
                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                                      🔴 Cancelada
                                    </span>
                                  )}

                                </div>

                                <div className="grid sm:grid-cols-2 gap-3 text-sm">

                                  <div className="bg-white rounded-2xl p-3 border border-gray-100">

                                    <p className="text-xs text-gray-400 font-semibold">
                                      📅 Fecha
                                    </p>

                                    <p className="font-bold text-gray-800 mt-1">
                                      {formatearFecha(
                                        cita.fecha
                                      )}
                                    </p>

                                  </div>

                                  <div className="bg-white rounded-2xl p-3 border border-gray-100">

                                    <p className="text-xs text-gray-400 font-semibold">
                                      🕐 Hora
                                    </p>

                                    <p className="font-bold text-gray-800 mt-1">
                                      {formatearHora(
                                        cita.hora
                                      )}
                                    </p>

                                  </div>

                                  <div className="bg-white rounded-2xl p-3 border border-gray-100">

                                    <p className="text-xs text-gray-400 font-semibold">
                                      🦶 Servicio
                                    </p>

                                    <p className="font-bold text-gray-800 mt-1">
                                      {cita.servicio}
                                    </p>

                                  </div>

                                  <div className="bg-white rounded-2xl p-3 border border-gray-100">

                                    <p className="text-xs text-gray-400 font-semibold">
                                      📞 Teléfono
                                    </p>

                                    <p className="font-bold text-gray-800 mt-1">
                                      {cita.telefono}
                                    </p>

                                  </div>

                                </div>

                                {cita.motivo && (
                                  <div className="mt-3 bg-white rounded-2xl p-3 border border-gray-100">

                                    <p className="text-xs text-gray-400 font-semibold">
                                      📝 Motivo de la cita
                                    </p>

                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                      {cita.motivo}
                                    </p>

                                  </div>
                                )}

                              </div>

                              {/* ACCIONES */}

                              <div className="w-full lg:w-52 flex flex-col gap-2">

                                <button
                                  onClick={() =>
                                    contactarPorWhatsApp(
                                      cita
                                    )
                                  }
                                  disabled={
                                    actualizandoCita ===
                                    cita.id
                                  }
                                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition disabled:bg-gray-300"
                                >
                                  💬 WhatsApp
                                </button>

                                {cita.estado !==
                                  "confirmada" && (
                                  <button
                                    onClick={() =>
                                      cambiarEstadoCita(
                                        cita.id,
                                        "confirmada"
                                      )
                                    }
                                    disabled={
                                      actualizandoCita ===
                                      cita.id
                                    }
                                    className="w-full py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-sm transition disabled:bg-gray-100 disabled:text-gray-400"
                                  >
                                    {actualizandoCita ===
                                    cita.id
                                      ? "⏳ Actualizando..."
                                      : "✅ Confirmar cita"}
                                  </button>
                                )}

                                {cita.estado !==
                                  "cancelada" && (
                                  <button
                                    onClick={() =>
                                      cambiarEstadoCita(
                                        cita.id,
                                        "cancelada"
                                      )
                                    }
                                    disabled={
                                      actualizandoCita ===
                                      cita.id
                                    }
                                    className="w-full py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm transition disabled:bg-gray-100 disabled:text-gray-400"
                                  >
                                    ❌ Cancelar cita
                                  </button>
                                )}

                                {cita.estado !==
                                  "pendiente" && (
                                  <button
                                    onClick={() =>
                                      cambiarEstadoCita(
                                        cita.id,
                                        "pendiente"
                                      )
                                    }
                                    disabled={
                                      actualizandoCita ===
                                      cita.id
                                    }
                                    className="w-full py-2.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold text-sm transition disabled:bg-gray-100 disabled:text-gray-400"
                                  >
                                    🟡 Marcar pendiente
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    eliminarCita(
                                      cita.id
                                    )
                                  }
                                  disabled={
                                    actualizandoCita ===
                                    cita.id
                                  }
                                  className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm transition disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                  🗑️ Eliminar
                                </button>

                              </div>

                            </div>

                          </div>

                        ))}

                      </div>
                    )}

                </div>
              )}

            </div>

            {/* BOTÓN PIE */}

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">

              <button
                onClick={() =>
                  setMostrarModal(true)
                }
                disabled={
                  guardando ||
                  subiendoFoto
                }
                className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold shadow-md transition text-sm"
              >
                💾 Guardar todos los cambios
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-100">

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿Confirmar cambios?
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que deseas guardar todos los cambios realizados en el sitio?
            </p>

            <div className="flex gap-3 justify-center">

              <button
                onClick={
                  confirmarGuardado
                }
                disabled={
                  guardando ||
                  subiendoFoto
                }
                className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold transition text-sm shadow-md"
              >
                {guardando
                  ? "Guardando..."
                  : "Sí, guardar"}
              </button>

              <button
                onClick={() =>
                  setMostrarModal(false)
                }
                disabled={
                  guardando ||
                  subiendoFoto
                }
                className="flex-1 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-bold transition text-sm"
              >
                No, cancelar
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}