"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Servicio = {
  titulo: string;
  desc: string;
  precio?: string;
};

type ContenidoInicio = {
  titulo: string;
  frase: string;
  descripcion: string;
};

type ContenidoUbicacion = {
  coordenadas: string;
  horario: string;
};

type ContenidoContacto = {
  whatsapp: string;
  telefono: string;
};

type Horario = {
  id: number;
  dia_semana: number;
  nombre_dia: string;
  activo: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
};

const inicioPorDefecto: ContenidoInicio = {
  titulo: "SERVICIO PODOLÓGICO HUSEY",
  frase: "Cuidado y bienestar para tus pies",
  descripcion:
    "Atención podológica profesional para cuidar la salud de tus pies y ayudarte a caminar con mayor comodidad.",
};

const serviciosPorDefecto: Servicio[] = [
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
];

const ubicacionPorDefecto: ContenidoUbicacion = {
  coordenadas: "19.480271, -98.818845",
  horario: "Próximamente agregaremos nuestros horarios.",
};

const contactoPorDefecto: ContenidoContacto = {
  whatsapp: "525624771365",
  telefono: "525624771365",
};

export default function Home() {
  const supabase = createClient();

  // ==============================
  // CONTENIDO DESDE SUPABASE
  // ==============================

  const [tituloInicio, setTituloInicio] = useState(
    inicioPorDefecto.titulo
  );

  const [fraseInicio, setFraseInicio] = useState(
    inicioPorDefecto.frase
  );

  const [descripcionInicio, setDescripcionInicio] = useState(
    inicioPorDefecto.descripcion
  );

  const [servicios, setServicios] = useState<Servicio[]>(
    serviciosPorDefecto
  );

  const [nosotrosTexto, setNosotrosTexto] = useState(
    "En Servicio Podológico Husey nos enfocamos en brindar atención profesional y personalizada para el cuidado de tus pies, buscando siempre ofrecer un servicio de calidad y confianza."
  );

  const [fotosGaleria, setFotosGaleria] = useState<string[]>([]);

  const [coordenadas, setCoordenadas] = useState(
    ubicacionPorDefecto.coordenadas
  );

  const [horarioUbicacion, setHorarioUbicacion] = useState(
    ubicacionPorDefecto.horario
  );

  const [whatsappContacto, setWhatsappContacto] = useState(
    contactoPorDefecto.whatsapp
  );

  const [telefonoContacto, setTelefonoContacto] = useState(
    contactoPorDefecto.telefono
  );

  const [cargandoContenido, setCargandoContenido] = useState(true);

  // ==============================
  // HORARIOS
  // ==============================

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);

  // ==============================
  // CARGAR TODO DESDE SUPABASE
  // ==============================

  useEffect(() => {
    let activo = true;

    const cargarContenido = async () => {
      try {
        // ==========================
        // SITE CONTENT
        // ==========================

        const { data, error } = await supabase
          .from("site_content")
          .select(
            "id, inicio, servicios, nosotros, galeria, ubicacion, contacto"
          )
          .eq("id", 1)
          .single();

        if (error) {
          console.error(
            "Error al cargar contenido desde Supabase:",
            error
          );
        }

        if (data && activo) {
          // ==========================
          // INICIO
          // ==========================

          const inicio =
            data.inicio as Partial<ContenidoInicio> | null;

          if (inicio) {
            setTituloInicio(
              inicio.titulo || inicioPorDefecto.titulo
            );

            setFraseInicio(
              inicio.frase || inicioPorDefecto.frase
            );

            setDescripcionInicio(
              inicio.descripcion ||
                inicioPorDefecto.descripcion
            );
          }

          // ==========================
          // SERVICIOS
          // ==========================

          if (Array.isArray(data.servicios)) {
            setServicios(data.servicios as Servicio[]);
          }

          // ==========================
          // NOSOTROS
          // ==========================

          if (typeof data.nosotros === "string") {
            setNosotrosTexto(data.nosotros);
          }

          // ==========================
          // GALERÍA
          // ==========================

          if (Array.isArray(data.galeria)) {
            setFotosGaleria(data.galeria as string[]);
          }

          // ==========================
          // UBICACIÓN
          // ==========================

          const ubicacion =
            data.ubicacion as Partial<ContenidoUbicacion> | null;

          if (ubicacion) {
            setCoordenadas(
              ubicacion.coordenadas ||
                ubicacionPorDefecto.coordenadas
            );

            setHorarioUbicacion(
              ubicacion.horario ||
                ubicacionPorDefecto.horario
            );
          }

          // ==========================
          // CONTACTO
          // ==========================

          const contacto =
            data.contacto as Partial<ContenidoContacto> | null;

          if (contacto) {
            setWhatsappContacto(
              contacto.whatsapp ||
                contactoPorDefecto.whatsapp
            );

            setTelefonoContacto(
              contacto.telefono ||
                contactoPorDefecto.telefono
            );
          }
        }
      } catch (error) {
        console.error(
          "Error inesperado al cargar Supabase:",
          error
        );
      } finally {
        if (activo) {
          setCargandoContenido(false);
        }
      }
    };

    // ==========================
    // CARGAR HORARIOS
    // ==========================

    const cargarHorarios = async () => {
      try {
        const { data, error } = await supabase
          .from("horarios")
          .select(
            "id, dia_semana, nombre_dia, activo, hora_inicio, hora_fin"
          )
          .order("dia_semana", { ascending: true });

        if (error) {
          console.error(
            "Error al cargar horarios:",
            error
          );
          return;
        }

        if (data && activo) {
          setHorarios(data as Horario[]);
        }
      } catch (error) {
        console.error(
          "Error inesperado al cargar horarios:",
          error
        );
      } finally {
        if (activo) {
          setCargandoHorarios(false);
        }
      }
    };

    cargarContenido();
    cargarHorarios();

    return () => {
      activo = false;
    };
  }, []);

  // ==============================
  // MENU MOVIL
  // ==============================

  const cerrarMenu = () => {
    const menu = document.getElementById(
      "mobile-menu"
    ) as HTMLInputElement | null;

    if (menu) {
      menu.checked = false;
    }
  };

  // ==============================
  // DATOS DEL FORMULARIO
  // ==============================

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");

  const [enviandoCita, setEnviandoCita] = useState(false);
  const [mensajeCita, setMensajeCita] = useState("");

  // ==============================
  // FECHA MINIMA
  // ==============================

  const fechaMinima = new Date()
    .toISOString()
    .split("T")[0];

  // ==============================
  // DETECTAR DIA SELECCIONADO
  // ==============================

  const diaSeleccionado = fecha
    ? (() => {
        const [anio, mes, dia] = fecha
          .split("-")
          .map(Number);

        const fechaLocal = new Date(
          anio,
          mes - 1,
          dia
        );

        const diaJavascript = fechaLocal.getDay();

        // JavaScript:
        // Domingo = 0
        // Lunes = 1
        // Martes = 2
        // ...
        // Sábado = 6
        //
        // Nuestra DB:
        // Lunes = 1
        // ...
        // Sábado = 6
        // Domingo = 7

        return diaJavascript === 0
          ? 7
          : diaJavascript;
      })()
    : null;

  // ==============================
  // HORARIO DEL DIA SELECCIONADO
  // ==============================

  const horarioSeleccionado =
    diaSeleccionado !== null
      ? horarios.find(
          (horarioItem) =>
            horarioItem.dia_semana ===
            diaSeleccionado
        ) || null
      : null;

  // ==============================
  // DIA CERRADO
  // ==============================

  const diaSinServicio =
    !!fecha &&
    !cargandoHorarios &&
    !!horarioSeleccionado &&
    !horarioSeleccionado.activo;

  // ==============================
  // HORAS DISPONIBLES
  // ==============================

  const horasDisponibles = (() => {
    if (
      !horarioSeleccionado ||
      !horarioSeleccionado.activo ||
      !horarioSeleccionado.hora_inicio ||
      !horarioSeleccionado.hora_fin
    ) {
      return [];
    }

    const horaInicio =
      Number(
        horarioSeleccionado.hora_inicio.split(":")[0]
      );

    const horaFin =
      Number(
        horarioSeleccionado.hora_fin.split(":")[0]
      );

    const horas: string[] = [];

    for (
      let horaActual = horaInicio;
      horaActual <= horaFin;
      horaActual++
    ) {
      const valorHora = `${String(
        horaActual
      ).padStart(2, "0")}:00`;

      horas.push(valorHora);
    }

    return horas;
  })();

  // ==============================
  // FORMATO HORA
  // ==============================

  const formatearHora = (horaValor: string) => {
    const [horaNumero] = horaValor
      .split(":")
      .map(Number);

    if (horaNumero === 0) {
      return "12:00 AM";
    }

    if (horaNumero < 12) {
      return `${String(horaNumero).padStart(
        2,
        "0"
      )}:00 AM`;
    }

    if (horaNumero === 12) {
      return "12:00 PM";
    }

    return `${String(horaNumero - 12).padStart(
      2,
      "0"
    )}:00 PM`;
  };

  // ==============================
  // CUANDO CAMBIA LA FECHA
  // ==============================

  const cambiarFecha = (
    nuevaFecha: string
  ) => {
    setFecha(nuevaFecha);
    setHora("");
    setMensajeCita("");

    if (!nuevaFecha) {
      return;
    }

    const [anio, mes, dia] = nuevaFecha
      .split("-")
      .map(Number);

    const fechaLocal = new Date(
      anio,
      mes - 1,
      dia
    );

    const diaJavascript =
      fechaLocal.getDay();

    const diaDB =
      diaJavascript === 0
        ? 7
        : diaJavascript;

    const horario = horarios.find(
      (horarioItem) =>
        horarioItem.dia_semana === diaDB
    );

    if (
      horario &&
      !horario.activo
    ) {
      setMensajeCita(
        "⚠️ Ese día no hay servicio. Por favor selecciona otra fecha."
      );
    }
  };

  // ==============================
  // FECHA FORMATEADA
  // ==============================

  const fechaFormateada = fecha
    ? (() => {
        const [anio, mes, dia] =
          fecha.split("-");

        return `${dia}/${mes}/${anio}`;
      })()
    : "";

  // ==============================
  // NUMEROS LIMPIOS
  // ==============================

  const whatsappNumero =
    whatsappContacto.replace(/\D/g, "");

  const telefonoNumero =
    telefonoContacto.replace(/\D/g, "");

  // ==============================
  // COORDENADAS
  // ==============================

  const partesCoordenadas = coordenadas
    .split(",")
    .map((valor) => valor.trim());

  const latitud =
    partesCoordenadas[0] ||
    "19.480271";

  const longitud =
    partesCoordenadas[1] ||
    "-98.818845";

  const destinoMapa = `${latitud},${longitud}`;

  // ==============================
  // SOLICITAR CITA
  // ==============================

  const solicitarCita = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (enviandoCita) {
      return;
    }

    setMensajeCita("");

    if (
      !nombre.trim() ||
      !telefono.trim() ||
      !servicio ||
      !fecha ||
      !hora
    ) {
      setMensajeCita(
        "Por favor completa todos los campos obligatorios."
      );

      return;
    }

    // ==========================
    // VALIDAR DIA DE SERVICIO
    // ==========================

    if (diaSinServicio) {
      setMensajeCita(
        "⚠️ Ese día no hay servicio. Por favor selecciona otra fecha."
      );

      setHora("");

      return;
    }

    // ==========================
    // VALIDAR HORARIO
    // ==========================

    if (
      horasDisponibles.length > 0 &&
      !horasDisponibles.includes(hora)
    ) {
      setMensajeCita(
        "⚠️ La hora seleccionada no está disponible para ese día."
      );

      setHora("");

      return;
    }

    try {
      setEnviandoCita(true);

      // ==========================
      // COMPROBAR DISPONIBILIDAD
      // ==========================

      const {
        data: citaExistente,
        error: errorConsulta,
      } = await supabase
        .from("citas")
        .select("id")
        .eq("fecha", fecha)
        .eq("hora", hora)
        .neq("estado", "cancelada")
        .limit(1);

      if (errorConsulta) {
        console.error(
          "Error al comprobar disponibilidad:",
          errorConsulta
        );

        setMensajeCita(
          "No se pudo comprobar la disponibilidad. Inténtalo nuevamente."
        );

        return;
      }

      if (
        citaExistente &&
        citaExistente.length > 0
      ) {
        setMensajeCita(
          "⚠️ Ese horario ya está ocupado. Por favor selecciona otra fecha u otra hora."
        );

        return;
      }

      // ==========================
      // GUARDAR EN SUPABASE
      // ==========================

      const { error } = await supabase
        .from("citas")
        .insert({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          servicio,
          fecha,
          hora,
          motivo: motivo.trim(),
          estado: "pendiente",
        });

      // ==========================
      // MANEJAR HORARIO OCUPADO
      // ==========================

      if (error) {
        console.error(
          "Error al guardar la cita:",
          error
        );

        if (error.code === "23505") {
          setMensajeCita(
            "⚠️ Ese horario acaba de ser reservado por otra persona. Por favor selecciona otra fecha u otra hora."
          );
        } else {
          setMensajeCita(
            "No se pudo registrar la cita. Inténtalo nuevamente."
          );
        }

        return;
      }

      // ==========================
      // MENSAJE DE WHATSAPP
      // ==========================

      const lineas = [
        "Hola, quiero solicitar una cita en Servicio Podológico Husey.",
        "",
        `*Nombre:* ${nombre.trim()}`,
        `*Teléfono / WhatsApp:* ${telefono.trim()}`,
        `*Servicio:* ${servicio}`,
        `*Fecha:* ${fechaFormateada}`,
        `*Hora:* ${formatearHora(hora)}`,
        `*Motivo de la consulta:* ${
          motivo.trim() || "No especificado"
        }`,
        "",
        "La cita quedó registrada como solicitud pendiente. Quedo pendiente de su confirmación. Muchas gracias.",
      ];

      const mensajeTexto =
        lineas.join("\n");

      setMensajeCita(
        "¡Cita registrada correctamente! Abriendo WhatsApp..."
      );

      // ==========================
      // ABRIR WHATSAPP
      // ==========================

      if (whatsappNumero) {
        const esMovil =
          /Android|iPhone|iPad|iPod|Mobile/i.test(
            navigator.userAgent
          );

        const url = esMovil
          ? `https://api.whatsapp.com/send?phone=${whatsappNumero}&text=${encodeURIComponent(
              mensajeTexto
            )}`
          : `https://web.whatsapp.com/send?phone=${whatsappNumero}&text=${encodeURIComponent(
              mensajeTexto
            )}`;

        if (esMovil) {
          window.location.href = url;
        } else {
          window.open(url, "_blank");
        }
      }

      // ==========================
      // LIMPIAR FORMULARIO
      // ==========================

      setNombre("");
      setTelefono("");
      setServicio("");
      setFecha("");
      setHora("");
      setMotivo("");
    } catch (error) {
      console.error(
        "Error inesperado al solicitar cita:",
        error
      );

      setMensajeCita(
        "Ocurrió un error inesperado. Inténtalo nuevamente."
      );
    } finally {
      setEnviandoCita(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
      style={{
        backgroundImage: "url('/fondo1.jpg')",
      }}
    >
      {/* ================================= */}
      {/* NAVBAR */}
      {/* ================================= */}

      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="#inicio"
            className="text-2xl font-bold text-pink-600"
          >
            HUSEY
          </a>

          <div className="hidden md:flex items-center gap-7 font-semibold">
            <a
              href="#inicio"
              className="hover:text-pink-600 transition"
            >
              Inicio
            </a>

            <a
              href="#servicios"
              className="hover:text-pink-600 transition"
            >
              Servicios
            </a>

            <a
              href="#nosotros"
              className="hover:text-pink-600 transition"
            >
              Nosotros
            </a>

            <a
              href="#galeria"
              className="hover:text-pink-600 transition"
            >
              Galería
            </a>

            <a
              href="#ubicacion"
              className="hover:text-pink-600 transition"
            >
              Ubicación
            </a>

            <a
              href="#contacto"
              className="hover:text-pink-600 transition"
            >
              Contacto
            </a>

            <a
              href="#cita"
              className="px-5 py-2.5 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition shadow-sm"
            >
              Agendar cita
            </a>
          </div>

          <div className="md:hidden">
            <input
              type="checkbox"
              id="mobile-menu"
              className="peer hidden"
            />

            <label
              htmlFor="mobile-menu"
              className="cursor-pointer block text-3xl font-bold text-pink-600 select-none"
            >
              <span className="peer-checked:hidden">
                ☰
              </span>

              <span className="hidden peer-checked:inline">
                ✕
              </span>
            </label>

            <div className="hidden peer-checked:block absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg">
              <div className="flex flex-col">
                <a
                  href="#inicio"
                  onClick={cerrarMenu}
                  className="px-7 py-5 text-lg font-semibold border-b border-gray-100 hover:bg-pink-50 hover:text-pink-600 transition"
                >
                  Inicio
                </a>

                <a
                  href="#servicios"
                  onClick={cerrarMenu}
                  className="px-7 py-5 text-lg font-semibold border-b border-gray-100 hover:bg-pink-50 hover:text-pink-600 transition"
                >
                  Servicios
                </a>

                <a
                  href="#nosotros"
                  onClick={cerrarMenu}
                  className="px-7 py-5 text-lg font-semibold border-b border-gray-100 hover:bg-pink-50 hover:text-pink-600 transition"
                >
                  Nosotros
                </a>

                <a
                  href="#galeria"
                  onClick={cerrarMenu}
                  className="px-7 py-5 text-lg font-semibold border-b border-gray-100 hover:bg-pink-50 hover:text-pink-600 transition"
                >
                  Galería
                </a>

                <a
                  href="#ubicacion"
                  onClick={cerrarMenu}
                  className="px-7 py-5 text-lg font-semibold border-b border-gray-100 hover:bg-pink-50 hover:text-pink-600 transition"
                >
                  Ubicación
                </a>

                <a
                  href="#contacto"
                  onClick={cerrarMenu}
                  className="px-7 py-5 text-lg font-semibold border-b border-gray-100 hover:bg-pink-50 hover:text-pink-600 transition"
                >
                  Contacto
                </a>

                <div className="p-5">
                  <a
                    href="#cita"
                    onClick={cerrarMenu}
                    className="block w-full py-4 rounded-full bg-pink-600 text-white text-center font-bold text-lg hover:bg-pink-700 transition shadow-md"
                  >
                    Agendar cita
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ================================= */}
      {/* INICIO */}
      {/* ================================= */}

      <section
        id="inicio"
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white/70 pt-24"
      >
        <p className="text-pink-600 font-semibold mb-3">
          {fraseInicio}
        </p>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          {tituloInicio}
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-8">
          {descripcionInicio}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#cita"
            className="px-8 py-4 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 shadow-md transition"
          >
            Agendar cita
          </a>

          <a
            href="#servicios"
            className="px-8 py-4 rounded-full border-2 border-pink-600 text-pink-600 font-semibold hover:bg-pink-100 transition"
          >
            Conocer servicios
          </a>
        </div>
      </section>

      {/* ================================= */}
      {/* SERVICIOS */}
      {/* ================================= */}

      <section
        id="servicios"
        className="py-24 px-6 bg-white/90"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-pink-600 font-semibold mb-2">
              Lo que ofrecemos
            </p>

            <h2 className="text-4xl font-bold mb-4">
              Nuestros servicios
            </h2>

            <p className="max-w-2xl mx-auto text-gray-600">
              Contamos con diferentes opciones de atención
              para ayudarte a mantener tus pies saludables y
              en las mejores condiciones.
            </p>
          </div>

          {cargandoContenido ? (
            <div className="text-center text-gray-400 py-10">
              Cargando servicios...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicios.map(
                (servicioItem, index) => {
                  const iconos = [
                    "🦶",
                    "✂️",
                    "🩹",
                    "✨",
                    "👣",
                    "💗",
                  ];

                  return (
                    <div
                      key={`${servicioItem.titulo}-${index}`}
                      className="p-8 rounded-3xl bg-white shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center mb-6">
                        <span className="text-2xl">
                          {
                            iconos[
                              index %
                                iconos.length
                            ]
                          }
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3">
                        {servicioItem.titulo}
                      </h3>

                      <p className="text-gray-600 leading-relaxed">
                        {servicioItem.desc}
                      </p>

                      {servicioItem.precio && (
                        <p className="text-pink-600 font-bold mt-4">
                          {servicioItem.precio}
                        </p>
                      )}

                      <a
                        href="#cita"
                        className="inline-block mt-6 text-pink-600 font-semibold hover:text-pink-700"
                      >
                        Agendar cita →
                      </a>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================================= */}
      {/* NOSOTROS */}
      {/* ================================= */}

      <section
        id="nosotros"
        className="py-20 px-6 bg-white/80"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-pink-600 font-semibold mb-2">
            Conócenos
          </p>

          <h2 className="text-4xl font-bold mb-6">
            Sobre nosotros
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            {nosotrosTexto}
          </p>
        </div>
      </section>

      {/* ================================= */}
      {/* GALERÍA */}
      {/* ================================= */}

      <section
        id="galeria"
        className="py-20 px-6 bg-white/90"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-pink-600 font-semibold mb-2">
              Conoce nuestro trabajo
            </p>

            <h2 className="text-4xl font-bold">
              Galería
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {fotosGaleria.length > 0 ? (
              fotosGaleria.map(
                (foto, index) => (
                  <div
                    key={`${foto}-${index}`}
                    className="h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 bg-gray-100"
                  >
                    <img
                      src={foto}
                      alt={`Galería ${
                        index + 1
                      }`}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                )
              )
            ) : (
              <p className="col-span-full text-center text-gray-400 py-8">
                Aún no hay fotos en la galería.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================================= */}
      {/* UBICACIÓN */}
      {/* ================================= */}

      <section
        id="ubicacion"
        className="py-20 px-6 bg-white/80"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-pink-600 font-semibold mb-2">
              Encuéntranos
            </p>

            <h2 className="text-4xl font-bold mb-4">
              Nuestra ubicación
            </h2>

            <p className="text-lg text-gray-600">
              Visítanos en nuestro consultorio. Estamos
              listos para atenderte.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-3xl shadow-md p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center shrink-0">
                  <span className="text-2xl">
                    📍
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Servicio Podológico Husey
                  </h3>

                  <p className="text-gray-600">
                    Ubicación del consultorio
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">
                    📍 Coordenadas
                  </p>

                  <p>{coordenadas}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    🕐 Horario
                  </p>

                  <p>{horarioUbicacion}</p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  destinoMapa
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-8 py-4 rounded-full bg-pink-600 text-white text-center font-bold hover:bg-pink-700 transition shadow-md"
              >
                🧭 Cómo llegar
              </a>
            </div>

            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  destinoMapa
                )}&z=17&output=embed`}
                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Servicio Podológico Husey"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================= */}
      {/* CONTACTO */}
      {/* ================================= */}

      <section
        id="contacto"
        className="py-20 px-6 bg-white/90"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-pink-600 font-semibold mb-2">
              Estamos para ayudarte
            </p>

            <h2 className="text-4xl font-bold mb-4">
              Contáctanos
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ¿Tienes alguna duda o quieres agendar una
              cita? Comunícate directamente con nosotros.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-3xl shadow-md p-7 text-center hover:shadow-xl hover:-translate-y-2 transition duration-300"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-5">
                <span className="text-3xl">
                  💬
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-pink-600 transition">
                WhatsApp
              </h3>

              <p className="text-gray-500 text-sm">
                Envíanos un mensaje directamente
              </p>
            </a>

            <a
              href={`tel:+${telefonoNumero}`}
              className="group bg-white rounded-3xl shadow-md p-7 text-center hover:shadow-xl hover:-translate-y-2 transition duration-300"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-100 flex items-center justify-center mb-5">
                <span className="text-3xl">
                  📞
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-pink-600 transition">
                Llamar
              </h3>

              <p className="text-gray-500 text-sm">
                Comunícate directamente con nosotros
              </p>
            </a>

            <div className="group bg-white rounded-3xl shadow-md p-7 text-center hover:shadow-xl hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                <span className="text-3xl">
                  📘
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2">
                Facebook
              </h3>

              <p className="text-gray-500 text-sm">
                Próximamente agregaremos nuestra página.
              </p>
            </div>

            <div className="group bg-white rounded-3xl shadow-md p-7 text-center hover:shadow-xl hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-100 flex items-center justify-center mb-5">
                <span className="text-3xl">
                  📸
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2">
                Instagram
              </h3>

              <p className="text-gray-500 text-sm">
                Próximamente agregaremos nuestro perfil.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-3xl shadow-md p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-100 flex items-center justify-center mb-4">
              <span className="text-2xl">
                🕐
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2">
              Horario de atención
            </h3>

            <p className="text-gray-600 whitespace-pre-line">
              {horarioUbicacion}
            </p>
          </div>
        </div>
      </section>

      {/* ================================= */}
      {/* AGENDAR CITA */}
      {/* ================================= */}

      <section
        id="cita"
        className="py-20 px-6 bg-pink-600 text-white"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-semibold mb-2 text-pink-100">
              Atención personalizada
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mb-5">
              Agenda tu cita
            </h2>

            <p className="text-lg text-pink-50 max-w-2xl mx-auto">
              Completa el siguiente formulario y solicita
              tu cita de manera rápida y sencilla.
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-6 md:p-10">
            <form
              className="space-y-6"
              onSubmit={solicitarCita}
            >
              {/* NOMBRE */}

              <div>
                <label
                  htmlFor="nombre"
                  className="block font-semibold mb-2"
                >
                  Nombre completo
                </label>

                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Escribe tu nombre completo"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                />
              </div>

              {/* TELEFONO */}

              <div>
                <label
                  htmlFor="telefono"
                  className="block font-semibold mb-2"
                >
                  Teléfono / WhatsApp
                </label>

                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  placeholder="Escribe tu número de teléfono"
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(e.target.value)
                  }
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                />
              </div>

              {/* SERVICIO */}

              <div>
                <label
                  htmlFor="servicio"
                  className="block font-semibold mb-2"
                >
                  Servicio
                </label>

                <select
                  id="servicio"
                  name="servicio"
                  value={servicio}
                  onChange={(e) =>
                    setServicio(e.target.value)
                  }
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                >
                  <option value="" disabled>
                    Selecciona un servicio
                  </option>

                  {servicios.map(
                    (servicioItem, index) => (
                      <option
                        key={`${servicioItem.titulo}-${index}`}
                        value={servicioItem.titulo}
                      >
                        {servicioItem.titulo}
                        {servicioItem.precio
                          ? ` - ${servicioItem.precio}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* FECHA Y HORA */}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fecha"
                    className="block font-semibold mb-2"
                  >
                    Fecha
                  </label>

                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    min={fechaMinima}
                    value={fecha}
                    onChange={(e) =>
                      cambiarFecha(
                        e.target.value
                      )
                    }
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  />

                  {/* AVISO DIA CERRADO */}

                  {diaSinServicio && (
                    <div className="mt-3 rounded-2xl bg-red-100 text-red-700 p-4 font-semibold">
                      ⚠️ Ese día no hay servicio.
                      <div className="font-normal text-sm mt-1">
                        Por favor selecciona otra fecha.
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="hora"
                    className="block font-semibold mb-2"
                  >
                    Hora
                  </label>

                  <select
                    id="hora"
                    name="hora"
                    value={hora}
                    onChange={(e) =>
                      setHora(e.target.value)
                    }
                    required
                    disabled={
                      cargandoHorarios ||
                      !fecha ||
                      diaSinServicio ||
                      horasDisponibles.length === 0
                    }
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>
                      {cargandoHorarios
                        ? "Cargando horarios..."
                        : !fecha
                        ? "Primero selecciona una fecha"
                        : diaSinServicio
                        ? "No hay servicio ese día"
                        : "Selecciona una hora"}
                    </option>

                    {horasDisponibles.map(
                      (horaDisponible) => (
                        <option
                          key={horaDisponible}
                          value={horaDisponible}
                        >
                          {formatearHora(
                            horaDisponible
                          )}
                        </option>
                      )
                    )}
                  </select>

                  {/* HORARIO DEL DIA */}

                  {fecha &&
                    !diaSinServicio &&
                    horarioSeleccionado &&
                    horarioSeleccionado.activo &&
                    horarioSeleccionado.hora_inicio &&
                    horarioSeleccionado.hora_fin && (
                      <p className="mt-2 text-sm text-gray-500">
                        🕐 Atención este día:{" "}
                        {formatearHora(
                          horarioSeleccionado.hora_inicio
                        )}{" "}
                        -{" "}
                        {formatearHora(
                          horarioSeleccionado.hora_fin
                        )}
                      </p>
                    )}
                </div>
              </div>

              {/* MOTIVO */}

              <div>
                <label
                  htmlFor="motivo"
                  className="block font-semibold mb-2"
                >
                  Motivo de la consulta{" "}
                  <span className="text-gray-400 font-normal">
                    (opcional)
                  </span>
                </label>

                <textarea
                  id="motivo"
                  name="motivo"
                  rows={4}
                  placeholder="Cuéntanos brevemente el motivo de tu consulta..."
                  value={motivo}
                  onChange={(e) =>
                    setMotivo(e.target.value)
                  }
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                />
              </div>

              {/* MENSAJE */}

              {mensajeCita && (
                <div
                  className={`rounded-2xl p-4 text-center font-semibold ${
                    mensajeCita.includes(
                      "correctamente"
                    )
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {mensajeCita}
                </div>
              )}

              {/* BOTON */}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    enviandoCita ||
                    diaSinServicio ||
                    !fecha ||
                    !hora
                  }
                  className="block w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-center hover:bg-pink-700 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviandoCita
                    ? "Registrando cita..."
                    : "Solicitar cita por WhatsApp"}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                Primero registraremos tu solicitud y
                después se abrirá WhatsApp para enviarla
                directamente a la podóloga.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ================================= */}
      {/* FOOTER */}
      {/* ================================= */}

      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p className="font-semibold">
          SERVICIO PODOLÓGICO HUSEY
        </p>

        <p className="text-sm text-gray-400 mt-2">
          © 2026 Todos los derechos reservados.
        </p>

        <a
          href="/login"
          className="inline-block text-sm text-gray-500 hover:text-pink-400 transition mt-4"
        >
          Acceso administrativo
        </a>
      </footer>
    </main>
  );
}