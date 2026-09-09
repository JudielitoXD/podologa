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

type Paciente = {
  id: string;
  nombre_completo: string;
  telefono: string | null;
  correo: string | null;
  fecha_nacimiento: string | null;
  notas_generales: string | null;
  created_at: string;
  updated_at: string;
};

type HistorialClinico = {
  id: string;
  patient_id: string;
  fecha_consulta: string;
  motivo_consulta: string | null;
  antecedentes: string | null;
  valoracion: string | null;
  tratamiento: string | null;
  observaciones: string | null;
  recomendaciones: string | null;
  created_at: string;
  updated_at: string;
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
  // PACIENTES / HISTORIAL CLÍNICO
  // =====================================================

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargandoPacientes, setCargandoPacientes] = useState(false);
  const [busquedaPaciente, setBusquedaPaciente] = useState("");

  const [pacienteSeleccionado, setPacienteSeleccionado] =
    useState<Paciente | null>(null);

  const [historialPaciente, setHistorialPaciente] = useState<
    HistorialClinico[]
  >([]);

  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [mostrarFormularioPaciente, setMostrarFormularioPaciente] =
    useState(false);

  const [mostrarFormularioConsulta, setMostrarFormularioConsulta] =
    useState(false);

  const [guardandoPaciente, setGuardandoPaciente] = useState(false);
  const [guardandoConsulta, setGuardandoConsulta] = useState(false);

  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre_completo: "",
    telefono: "",
    correo: "",
    fecha_nacimiento: "",
    notas_generales: "",
  });

  const [nuevaConsulta, setNuevaConsulta] = useState({
    fecha_consulta: new Date().toISOString().split("T")[0],
    motivo_consulta: "",
    antecedentes: "",
    valoracion: "",
    tratamiento: "",
    observaciones: "",
    recomendaciones: "",
  });

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
  // CARGAR PACIENTES
  // =====================================================

  const cargarPacientes = async () => {
    const supabase = createClient();

    try {
      setCargandoPacientes(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("patients")
        .select(
          "id, nombre_completo, telefono, correo, fecha_nacimiento, notas_generales, created_at, updated_at"
        )
        .order("nombre_completo", {
          ascending: true,
        });

      if (error) {
        console.error(
          "ERROR AL CARGAR PACIENTES:",
          error
        );

        mostrarMensajeNotificacion(
          `❌ Error al cargar pacientes: ${error.message}`
        );

        return;
      }

      setPacientes(data || []);
    } catch (error) {
      console.error(
        "ERROR INESPERADO AL CARGAR PACIENTES:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al cargar los pacientes."
      );
    } finally {
      setCargandoPacientes(false);
    }
  };

  // =====================================================
  // CREAR PACIENTE
  // =====================================================

  const crearPaciente = async () => {
    if (guardandoPaciente) return;

    if (!nuevoPaciente.nombre_completo.trim()) {
      mostrarMensajeNotificacion(
        "❌ El nombre del paciente es obligatorio."
      );
      return;
    }

    const supabase = createClient();

    try {
      setGuardandoPaciente(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("patients")
        .insert({
          nombre_completo:
            nuevoPaciente.nombre_completo.trim(),
          telefono:
            nuevoPaciente.telefono.trim() || null,
          correo:
            nuevoPaciente.correo.trim() || null,
          fecha_nacimiento:
            nuevoPaciente.fecha_nacimiento || null,
          notas_generales:
            nuevoPaciente.notas_generales.trim() || null,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "ERROR AL CREAR PACIENTE:",
          error
        );

        mostrarMensajeNotificacion(
          `❌ No se pudo crear el paciente: ${error.message}`
        );

        return;
      }

      setPacientes((actuales) =>
        [...actuales, data].sort((a, b) =>
          a.nombre_completo.localeCompare(
            b.nombre_completo
          )
        )
      );

      setNuevoPaciente({
        nombre_completo: "",
        telefono: "",
        correo: "",
        fecha_nacimiento: "",
        notas_generales: "",
      });

      setMostrarFormularioPaciente(false);

      mostrarMensajeNotificacion(
        "✅ Paciente registrado correctamente."
      );
    } catch (error) {
      console.error(
        "ERROR INESPERADO AL CREAR PACIENTE:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al registrar el paciente."
      );
    } finally {
      setGuardandoPaciente(false);
    }
  };

  // =====================================================
  // SELECCIONAR PACIENTE
  // =====================================================

  const seleccionarPaciente = async (
    paciente: Paciente
  ) => {
    setPacienteSeleccionado(paciente);
    setHistorialPaciente([]);

    const supabase = createClient();

    try {
      setCargandoHistorial(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("clinical_records")
        .select(
          "id, patient_id, fecha_consulta, motivo_consulta, antecedentes, valoracion, tratamiento, observaciones, recomendaciones, created_at, updated_at"
        )
        .eq("patient_id", paciente.id)
        .order("fecha_consulta", {
          ascending: false,
        });

      if (error) {
        console.error(
          "ERROR AL CARGAR HISTORIAL:",
          error
        );

        mostrarMensajeNotificacion(
          `❌ Error al cargar historial: ${error.message}`
        );

        return;
      }

      setHistorialPaciente(data || []);
    } catch (error) {
      console.error(
        "ERROR INESPERADO AL CARGAR HISTORIAL:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al cargar el historial."
      );
    } finally {
      setCargandoHistorial(false);
    }
  };

  // =====================================================
  // CREAR CONSULTA
  // =====================================================

  const crearConsulta = async () => {
    if (guardandoConsulta) return;

    if (!pacienteSeleccionado) {
      mostrarMensajeNotificacion(
        "❌ Primero selecciona un paciente."
      );
      return;
    }

    const supabase = createClient();

    try {
      setGuardandoConsulta(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("clinical_records")
        .insert({
          patient_id:
            pacienteSeleccionado.id,
          fecha_consulta:
            nuevaConsulta.fecha_consulta,
          motivo_consulta:
            nuevaConsulta.motivo_consulta.trim() ||
            null,
          antecedentes:
            nuevaConsulta.antecedentes.trim() ||
            null,
          valoracion:
            nuevaConsulta.valoracion.trim() ||
            null,
          tratamiento:
            nuevaConsulta.tratamiento.trim() ||
            null,
          observaciones:
            nuevaConsulta.observaciones.trim() ||
            null,
          recomendaciones:
            nuevaConsulta.recomendaciones.trim() ||
            null,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "ERROR AL CREAR CONSULTA:",
          error
        );

        mostrarMensajeNotificacion(
          `❌ No se pudo guardar la consulta: ${error.message}`
        );

        return;
      }

      setHistorialPaciente((actuales) =>
        [data, ...actuales].sort(
          (a, b) =>
            new Date(
              b.fecha_consulta
            ).getTime() -
            new Date(
              a.fecha_consulta
            ).getTime()
        )
      );

      setNuevaConsulta({
        fecha_consulta:
          new Date()
            .toISOString()
            .split("T")[0],
        motivo_consulta: "",
        antecedentes: "",
        valoracion: "",
        tratamiento: "",
        observaciones: "",
        recomendaciones: "",
      });

      setMostrarFormularioConsulta(false);

      mostrarMensajeNotificacion(
        "✅ Consulta agregada al historial."
      );
    } catch (error) {
      console.error(
        "ERROR INESPERADO AL CREAR CONSULTA:",
        error
      );

      mostrarMensajeNotificacion(
        "❌ Ocurrió un error al guardar la consulta."
      );
    } finally {
      setGuardandoConsulta(false);
    }
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
  // CARGAR PACIENTES AL ENTRAR A LA SECCIÓN
  // =====================================================

  useEffect(() => {
    if (
      seccionActiva === "pacientes" &&
      pacientes.length === 0
    ) {
      cargarPacientes();
    }
  }, [seccionActiva]);

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

      // GUARDAR SITE CONTENT

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

      // GUARDAR HORARIOS

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

      await cargarHorarios();

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
// DESCARGAR HISTORIAL CLÍNICO EN PDF
// =====================================================

const descargarPDF = async () => {
  if (!pacienteSeleccionado) {
    mostrarMensajeNotificacion("Selecciona un paciente primero.");
    return;
  }

  if (historialPaciente.length === 0) {
    mostrarMensajeNotificacion(
      "Este paciente todavía no tiene consultas registradas."
    );
    return;
  }

  try {
    const { default: jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const paginaAncho = 210;
    const margen = 18;
    const anchoContenido = paginaAncho - margen * 2;

    let y = 20;
   

    // =====================================================
    // FUNCIONES AUXILIARES
    // =====================================================

    const dibujarLinea = (posY: number) => {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.4);
      doc.line(
        margen,
        posY,
        paginaAncho - margen,
        posY
      );
    };

    const revisarEspacio = (alturaNecesaria: number) => {
      if (y + alturaNecesaria > 270) {
        doc.addPage();
        y = 20;
        return true;
      }

      return false;
    };

    const agregarCampo = (
      tituloCampo: string,
      contenido: string | null | undefined
    ) => {
      if (!contenido || contenido.trim() === "") {
        return;
      }

      const texto = contenido.trim();

      const lineas = doc.splitTextToSize(
        texto,
        anchoContenido - 10
      );

      const altura = 9 + lineas.length * 5;

      revisarEspacio(altura);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      doc.text(
        tituloCampo.toUpperCase(),
        margen + 5,
        y
      );

      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(45, 45, 45);

      doc.text(
        lineas,
        margen + 5,
        y
      );

      y += lineas.length * 5 + 5;
    };

    // =====================================================
    // ENCABEZADO
    // =====================================================

    doc.setFillColor(245, 247, 250);

    doc.roundedRect(
      margen,
      15,
      anchoContenido,
      35,
      4,
      4,
      "F"
    );
    

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(35, 35, 35);

    doc.text(
      "SERVICIO PODOLOGICO HUSEY",
      paginaAncho / 2,
      27,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);

    doc.text(
      "HISTORIA CLINICA PODOLOGICA",
      paginaAncho / 2,
      35,
      { align: "center" }
    );

    doc.setFontSize(8);

    doc.text(
      `Documento generado: ${new Date().toLocaleDateString(
        "es-MX"
      )}`,
      paginaAncho / 2,
      42,
      { align: "center" }
    );

    y = 60;

    // =====================================================
    // DATOS DEL PACIENTE
    // =====================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(35, 35, 35);

    doc.text(
      "DATOS DEL PACIENTE",
      margen,
      y
    );

    y += 5;

    dibujarLinea(y);

    y += 9;

    const datosPaciente = [
      [
        "Nombre",
        pacienteSeleccionado.nombre_completo,
      ],
      [
        "Telefono",
        pacienteSeleccionado.telefono ||
          "No registrado",
      ],
      [
        "Correo",
        pacienteSeleccionado.correo ||
          "No registrado",
      ],
      [
        "Fecha de nacimiento",
        pacienteSeleccionado.fecha_nacimiento
          ? formatearFecha(
              pacienteSeleccionado.fecha_nacimiento
            )
          : "No registrada",
      ],
    ];

    const columnasX = [
      margen + 5,
      105,
    ];

    datosPaciente.forEach((dato, index) => {
      const columna = index % 2;
      const fila = Math.floor(index / 2);

      const x = columnasX[columna];
      const posicionY = y + fila * 18;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      doc.text(
        dato[0].toUpperCase(),
        x,
        posicionY
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);

      const textoDato = doc.splitTextToSize(
        dato[1],
        78
      );

      doc.text(
        textoDato,
        x,
        posicionY + 6
      );
    });

    y += 42;

    // =====================================================
    // NOTAS GENERALES
    // =====================================================

    if (pacienteSeleccionado.notas_generales) {
      doc.setFillColor(250, 250, 250);

      const notas = doc.splitTextToSize(
        pacienteSeleccionado.notas_generales,
        anchoContenido - 14
      );

      const altoNotas =
        14 + notas.length * 5;

      revisarEspacio(altoNotas);

      doc.roundedRect(
        margen,
        y,
        anchoContenido,
        altoNotas,
        3,
        3,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      doc.text(
        "NOTAS GENERALES",
        margen + 7,
        y + 7
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(45, 45, 45);

      doc.text(
        notas,
        margen + 7,
        y + 13
      );

      y += altoNotas + 10;
    }

    // =====================================================
    // TITULO HISTORIAL
    // =====================================================

    revisarEspacio(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(35, 35, 35);

    doc.text(
      "HISTORIAL DE CONSULTAS",
      margen,
      y
    );

    y += 5;

    dibujarLinea(y);

    y += 10;

    // =====================================================
    // CONSULTAS
    // =====================================================

    historialPaciente.forEach(
      (consulta, index) => {
        const numeroConsulta =
          historialPaciente.length - index;

        revisarEspacio(30);

        // Encabezado de consulta
        doc.setFillColor(245, 247, 250);

        doc.roundedRect(
          margen,
          y,
          anchoContenido,
          16,
          3,
          3,
          "F"
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(35, 35, 35);

        doc.text(
          `CONSULTA #${numeroConsulta}`,
          margen + 6,
          y + 7
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);

        doc.text(
          `Fecha: ${formatearFecha(
            consulta.fecha_consulta
          )}`,
          margen + 6,
          y + 12
        );

        y += 23;

        agregarCampo(
          "Motivo de consulta",
          consulta.motivo_consulta
        );

        agregarCampo(
          "Antecedentes",
          consulta.antecedentes
        );

        agregarCampo(
          "Valoracion",
          consulta.valoracion
        );

        agregarCampo(
          "Tratamiento",
          consulta.tratamiento
        );

        agregarCampo(
          "Observaciones",
          consulta.observaciones
        );

        agregarCampo(
          "Recomendaciones",
          consulta.recomendaciones
        );

        if (
          index <
          historialPaciente.length - 1
        ) {
          revisarEspacio(10);

          dibujarLinea(y);

          y += 10;
        }
      }
    );
// =====================================================
// FIRMA Y ESPACIO PARA SELLO
// =====================================================

revisarEspacio(55);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(60, 60, 60);

// Línea para firma
doc.line(
  margen + 5,
  y + 25,
  margen + 80,
  y + 25
);

doc.text(
  "Firma de la podóloga",
  margen + 5,
  y + 31
);


    // =====================================================
    // PIE DE PAGINA
    // =====================================================

    const totalPaginas =
      doc.getNumberOfPages();

    for (
      let pagina = 1;
      pagina <= totalPaginas;
      pagina++
    ) {
      doc.setPage(pagina);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);

      doc.text(
        "Documento confidencial - Historial clinico podologico",
        margen,
        288
      );

      doc.text(
        `Pagina ${pagina} de ${totalPaginas}`,
        paginaAncho - margen,
        288,
        { align: "right" }
      );
    }

    // =====================================================
    // NOMBRE DEL ARCHIVO
    // =====================================================

    const nombreArchivo =
      pacienteSeleccionado.nombre_completo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    doc.save(
      `Historia_Clinica_${
        nombreArchivo || "Paciente"
      }.pdf`
    );

    mostrarMensajeNotificacion(
      "Historia clinica PDF generada correctamente."
    );
  } catch (error) {
    console.error(
      "Error al generar el PDF:",
      error
    );

    mostrarMensajeNotificacion(
      "Ocurrio un error al generar el PDF."
    );
  }
};

      

      
  // =====================================================
  // SUBIR FOTO A SUPABASE STORAGE
  // =====================================================

  const subirFotoDispositivo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivos = e.target.files;

    if (!archivos || archivos.length === 0) {
      return;
    }

    const archivo = archivos[0];

    if (!archivo.type.startsWith("image/")) {
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

      if (errorUsuario) {
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

      if (errorSubida) {
        mostrarMensajeNotificacion(
          `❌ Error al subir: ${errorSubida.message}`
        );

        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("galeria")
        .getPublicUrl(nombreArchivo);

      if (!publicUrl) {
        await supabase.storage
          .from("galeria")
          .remove([nombreArchivo]);

        mostrarMensajeNotificacion(
          "❌ No se pudo obtener la URL pública."
        );

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
      const url = new URL(foto);

      const partes = url.pathname.split(
        "/storage/v1/object/public/galeria/"
      );

      const nombreArchivo =
        partes.length > 1
          ? decodeURIComponent(partes[1])
          : null;

      if (nombreArchivo) {
        const { error } =
          await supabase.storage
            .from("galeria")
            .remove([nombreArchivo]);

        if (error) {
          mostrarMensajeNotificacion(
            `❌ No se pudo eliminar la imagen: ${error.message}`
          );

          return;
        }
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
                {
                  id: "pacientes",
                  label: "🦶 Pacientes",
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

                  {!cargandoCitas &&
                    citas.length > 0 && (
                      <div className="space-y-4">

                        {citas.map((cita) => (

                          <div
                            key={cita.id}
                            className="bg-gray-50 border border-gray-200 rounded-3xl p-5 shadow-sm"
                          >

                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

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

              {/* =====================================================
                  PACIENTES / HISTORIAL CLÍNICO
              ===================================================== */}

              {seccionActiva === "pacientes" && (
                <div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>

                      <h2 className="text-2xl font-bold text-gray-800">
                        Pacientes
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Administra los pacientes y su historial clínico privado.
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={cargarPacientes}
                        disabled={cargandoPacientes}
                        className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-bold text-sm transition"
                      >
                        {cargandoPacientes
                          ? "⏳ Cargando..."
                          : "🔄 Actualizar"}
                      </button>

                      <button
                        onClick={() =>
                          setMostrarFormularioPaciente(true)
                        }
                        className="px-5 py-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm transition shadow-md"
                      >
                        ➕ Nuevo paciente
                      </button>

                    </div>

                  </div>

                  <div className="mb-6">

                    <input
                      type="text"
                      value={busquedaPaciente}
                      onChange={(e) =>
                        setBusquedaPaciente(
                          e.target.value
                        )
                      }
                      placeholder="🔎 Buscar paciente por nombre..."
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />

                  </div>

                  {/* NUEVO PACIENTE */}

                  {mostrarFormularioPaciente && (
                    <div className="mb-6 bg-pink-50 border border-pink-100 rounded-3xl p-5">

                      <div className="flex items-center justify-between mb-5">

                        <h3 className="text-lg font-bold text-gray-800">
                          Registrar nuevo paciente
                        </h3>

                        <button
                          onClick={() =>
                            setMostrarFormularioPaciente(false)
                          }
                          className="text-gray-400 hover:text-gray-700 text-xl"
                        >
                          ✕
                        </button>

                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">

                        <div className="sm:col-span-2">

                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Nombre completo *
                          </label>

                          <input
                            type="text"
                            value={
                              nuevoPaciente.nombre_completo
                            }
                            onChange={(e) =>
                              setNuevoPaciente({
                                ...nuevoPaciente,
                                nombre_completo:
                                  e.target.value,
                              })
                            }
                            placeholder="Nombre completo"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                          />

                        </div>

                        <div>

                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Teléfono
                          </label>

                          <input
                            type="tel"
                            value={
                              nuevoPaciente.telefono
                            }
                            onChange={(e) =>
                              setNuevoPaciente({
                                ...nuevoPaciente,
                                telefono:
                                  e.target.value,
                              })
                            }
                            placeholder="Teléfono"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                          />

                        </div>

                        <div>

                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Correo electrónico
                          </label>

                          <input
                            type="email"
                            value={
                              nuevoPaciente.correo
                            }
                            onChange={(e) =>
                              setNuevoPaciente({
                                ...nuevoPaciente,
                                correo:
                                  e.target.value,
                              })
                            }
                            placeholder="correo@ejemplo.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                          />

                        </div>

                        <div>

                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Fecha de nacimiento
                          </label>

                          <input
                            type="date"
                            value={
                              nuevoPaciente.fecha_nacimiento
                            }
                            onChange={(e) =>
                              setNuevoPaciente({
                                ...nuevoPaciente,
                                fecha_nacimiento:
                                  e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                          />

                        </div>

                        <div>

                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Notas generales
                          </label>

                          <input
                            type="text"
                            value={
                              nuevoPaciente.notas_generales
                            }
                            onChange={(e) =>
                              setNuevoPaciente({
                                ...nuevoPaciente,
                                notas_generales:
                                  e.target.value,
                              })
                            }
                            placeholder="Notas generales"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                          />

                        </div>

                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-5">

                        <button
                          onClick={crearPaciente}
                          disabled={guardandoPaciente}
                          className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-sm transition"
                        >
                          {guardandoPaciente
                            ? "⏳ Guardando..."
                            : "💾 Registrar paciente"}
                        </button>

                        <button
                          onClick={() =>
                            setMostrarFormularioPaciente(false)
                          }
                          disabled={guardandoPaciente}
                          className="flex-1 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm transition"
                        >
                          Cancelar
                        </button>

                      </div>

                    </div>
                  )}

                  {/* PACIENTE SELECCIONADO */}

                  {pacienteSeleccionado ? (
                    <div>

                      <button
                        onClick={() => {
                          setPacienteSeleccionado(null);
                          setHistorialPaciente([]);
                          setMostrarFormularioConsulta(false);
                        }}
                        className="mb-4 text-sm font-bold text-pink-600 hover:text-pink-800"
                      >
                        ← Volver a pacientes
                      </button>

                      {/* DATOS DEL PACIENTE */}

                      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm mb-6">

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                          <div>

                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              Paciente
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                              {pacienteSeleccionado.nombre_completo}
                            </h3>

                          </div>

                          <button
  onClick={() =>
    setMostrarFormularioConsulta(true)
  }
  className="px-5 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md transition"
>
  ➕ Nueva consulta
</button>

<button
  type="button"
  onClick={descargarPDF}
  className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition"
>
  📄 Descargar PDF
</button>                

                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

                          <div className="bg-gray-50 rounded-2xl p-3">

                            <p className="text-xs text-gray-400 font-semibold">
                              📞 Teléfono
                            </p>

                            <p className="font-bold text-gray-800 mt-1 text-sm">
                              {pacienteSeleccionado.telefono ||
                                "No registrado"}
                            </p>

                          </div>

                          <div className="bg-gray-50 rounded-2xl p-3">

                            <p className="text-xs text-gray-400 font-semibold">
                              ✉️ Correo
                            </p>

                            <p className="font-bold text-gray-800 mt-1 text-sm break-words">
                              {pacienteSeleccionado.correo ||
                                "No registrado"}
                            </p>

                          </div>

                          <div className="bg-gray-50 rounded-2xl p-3">

                            <p className="text-xs text-gray-400 font-semibold">
                              🎂 Fecha de nacimiento
                            </p>

                            <p className="font-bold text-gray-800 mt-1 text-sm">
                              {pacienteSeleccionado.fecha_nacimiento
                                ? formatearFecha(
                                    pacienteSeleccionado.fecha_nacimiento
                                  )
                                : "No registrada"}
                            </p>

                          </div>

                        </div>

                        {pacienteSeleccionado.notas_generales && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-2xl p-3">

                            <p className="text-xs text-yellow-700 font-semibold">
                              📝 Notas generales
                            </p>

                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                              {pacienteSeleccionado.notas_generales}
                            </p>

                          </div>
                        )}

                      </div>

                      {/* NUEVA CONSULTA */}

                      {mostrarFormularioConsulta && (
                        <div className="mb-6 bg-pink-50 border border-pink-100 rounded-3xl p-5">

                          <div className="flex items-center justify-between mb-5">

                            <div>

                              <h3 className="text-lg font-bold text-gray-800">
                                Nueva consulta
                              </h3>

                              <p className="text-xs text-gray-500 mt-1">
                                Registra la información clínica de esta consulta.
                              </p>

                            </div>

                            <button
                              onClick={() =>
                                setMostrarFormularioConsulta(false)
                              }
                              className="text-gray-400 hover:text-gray-700 text-xl"
                            >
                              ✕
                            </button>

                          </div>

                          <div className="space-y-4">

                            <div>

                              <label className="block text-xs font-bold text-gray-600 mb-1">
                                Fecha de consulta
                              </label>

                              <input
                                type="date"
                                value={
                                  nuevaConsulta.fecha_consulta
                                }
                                onChange={(e) =>
                                  setNuevaConsulta({
                                    ...nuevaConsulta,
                                    fecha_consulta:
                                      e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                              />

                            </div>

                            {[
                              {
                                key: "motivo_consulta",
                                label: "Motivo de consulta",
                                placeholder:
                                  "¿Por qué acudió el paciente?",
                              },
                              {
                                key: "antecedentes",
                                label: "Antecedentes relevantes",
                                placeholder:
                                  "Antecedentes médicos relevantes...",
                              },
                              {
                                key: "valoracion",
                                label: "Valoración / exploración",
                                placeholder:
                                  "Observaciones de la valoración podológica...",
                              },
                              {
                                key: "tratamiento",
                                label: "Tratamiento",
                                placeholder:
                                  "Tratamiento realizado...",
                              },
                              {
                                key: "observaciones",
                                label: "Observaciones",
                                placeholder:
                                  "Observaciones adicionales...",
                              },
                              {
                                key: "recomendaciones",
                                label: "Recomendaciones",
                                placeholder:
                                  "Recomendaciones para el paciente...",
                              },
                            ].map((campo) => (
                              <div key={campo.key}>

                                <label className="block text-xs font-bold text-gray-600 mb-1">
                                  {campo.label}
                                </label>

                                <textarea
                                  rows={4}
                                  value={
                                    nuevaConsulta[
                                      campo.key as keyof typeof nuevaConsulta
                                    ]
                                  }
                                  onChange={(e) =>
                                    setNuevaConsulta({
                                      ...nuevaConsulta,
                                      [campo.key]:
                                        e.target.value,
                                    })
                                  }
                                  placeholder={campo.placeholder}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-sm"
                                />

                              </div>
                            ))}

                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 mt-5">

                            <button
                              onClick={crearConsulta}
                              disabled={guardandoConsulta}
                              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-sm transition"
                            >
                              {guardandoConsulta
                                ? "⏳ Guardando..."
                                : "💾 Guardar consulta"}
                            </button>

                            <button
                              onClick={() =>
                                setMostrarFormularioConsulta(false)
                              }
                              disabled={guardandoConsulta}
                              className="flex-1 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm transition"
                            >
                              Cancelar
                            </button>

                          </div>

                        </div>
                      )}

                      {/* HISTORIAL */}

                      <div>

                        <div className="flex items-center justify-between mb-4">

                          <div>

                            <h3 className="text-xl font-bold text-gray-800">
                              Historial clínico
                            </h3>

                            <p className="text-xs text-gray-500 mt-1">
                              {historialPaciente.length}{" "}
                              {historialPaciente.length === 1
                                ? "consulta registrada"
                                : "consultas registradas"}
                            </p>

                          </div>

                        </div>

                        {cargandoHistorial ? (
                          <div className="text-center py-12">

                            <div className="text-4xl mb-3">
                              🩺
                            </div>

                            <p className="text-gray-500 font-semibold">
                              Cargando historial...
                            </p>

                          </div>
                        ) : historialPaciente.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">

                            <div className="text-5xl mb-4">
                              📋
                            </div>

                            <p className="font-bold text-gray-600">
                              No hay consultas registradas
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                              Agrega la primera consulta de este paciente.
                            </p>

                          </div>
                        ) : (
                          <div className="space-y-4">

                            {historialPaciente.map(
                              (consulta) => (
                                <div
                                  key={consulta.id}
                                  className="bg-gray-50 border border-gray-200 rounded-3xl p-5"
                                >

                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">

                                    <h4 className="text-lg font-bold text-gray-900">
                                      Consulta del{" "}
                                      {formatearFecha(
                                        consulta.fecha_consulta
                                      )}
                                    </h4>

                                    <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                                      🩺 Consulta
                                    </span>

                                  </div>

                                  <div className="space-y-3">

                                    {[
                                      {
                                        label:
                                          "Motivo de consulta",
                                        value:
                                          consulta.motivo_consulta,
                                      },
                                      {
                                        label:
                                          "Antecedentes",
                                        value:
                                          consulta.antecedentes,
                                      },
                                      {
                                        label:
                                          "Valoración / exploración",
                                        value:
                                          consulta.valoracion,
                                      },
                                      {
                                        label:
                                          "Tratamiento",
                                        value:
                                          consulta.tratamiento,
                                      },
                                      {
                                        label:
                                          "Observaciones",
                                        value:
                                          consulta.observaciones,
                                      },
                                      {
                                        label:
                                          "Recomendaciones",
                                        value:
                                          consulta.recomendaciones,
                                      },
                                    ]
                                      .filter(
                                        (campo) =>
                                          campo.value
                                      )
                                      .map(
                                        (campo) => (
                                          <div
                                            key={
                                              campo.label
                                            }
                                            className="bg-white rounded-2xl p-4 border border-gray-100"
                                          >

                                            <p className="text-xs text-gray-400 font-bold mb-1">
                                              {campo.label}
                                            </p>

                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                              {
                                                campo.value
                                              }
                                            </p>

                                          </div>
                                        )
                                      )}

                                  </div>

                                </div>
                              )
                            )}

                          </div>
                        )}

                      </div>

                    </div>
                  ) : (
                    /* LISTA DE PACIENTES */

                    <div>

                      {cargandoPacientes ? (
                        <div className="text-center py-12">

                          <div className="text-5xl mb-3">
                            🦶
                          </div>

                          <p className="text-gray-500 font-semibold">
                            Cargando pacientes...
                          </p>

                        </div>
                      ) : (
                        (() => {
                          const pacientesFiltrados =
                            pacientes.filter(
                              (paciente) =>
                                paciente.nombre_completo
                                  .toLowerCase()
                                  .includes(
                                    busquedaPaciente
                                      .toLowerCase()
                                  )
                            );

                          if (
                            pacientesFiltrados.length ===
                            0
                          ) {
                            return (
                              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">

                                <div className="text-5xl mb-4">
                                  {pacientes.length === 0
                                    ? "👤"
                                    : "🔎"}
                                </div>

                                <p className="font-bold text-gray-600">
                                  {pacientes.length === 0
                                    ? "No hay pacientes registrados"
                                    : "No se encontraron pacientes"}
                                </p>

                                <p className="text-sm text-gray-400 mt-1">
                                  {pacientes.length === 0
                                    ? "Registra tu primer paciente para comenzar."
                                    : "Prueba con otro nombre."}
                                </p>

                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3">

                              {pacientesFiltrados.map(
                                (paciente) => (
                                  <button
                                    key={paciente.id}
                                    onClick={() =>
                                      seleccionarPaciente(
                                        paciente
                                      )
                                    }
                                    className="w-full text-left bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 rounded-3xl p-5 transition"
                                  >

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                      <div>

                                        <h3 className="text-lg font-bold text-gray-900">
                                          {paciente.nombre_completo}
                                        </h3>

                                        <div className="flex flex-wrap gap-2 mt-2">

                                          {paciente.telefono && (
                                            <span className="px-3 py-1 bg-white rounded-full border border-gray-100 text-xs text-gray-600">
                                              📞{" "}
                                              {
                                                paciente.telefono
                                              }
                                            </span>
                                          )}

                                          {paciente.correo && (
                                            <span className="px-3 py-1 bg-white rounded-full border border-gray-100 text-xs text-gray-600">
                                              ✉️{" "}
                                              {
                                                paciente.correo
                                              }
                                            </span>
                                          )}

                                        </div>

                                      </div>

                                      <span className="text-pink-600 font-bold text-sm">
                                        Ver historial →
                                      </span>

                                    </div>

                                  </button>
                                )
                              )}

                            </div>
                          );
                        })()
                      )}

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