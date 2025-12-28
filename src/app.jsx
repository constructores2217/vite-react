import React, { useState, useEffect } from 'react'; 
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { LayoutGrid, HardHat, Truck, FileText, AlertCircle, Database, Wallet, FileUp, CheckCircle2 } from 'lucide-react';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- AUXILIARY FUNCTIONS ---
function generarReportePDF(proyectoSeleccionado) {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();
  doc.setFillColor(250, 204, 21);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("WM CONSTRUCTORA", 15, 25);
  doc.setFontSize(10);
  doc.text("REPORTE EJECUTIVO DE PROYECTO", 15, 32);
  doc.text(`FECHA: ${fecha}`, 160, 25);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.text(`Proyecto: ${proyectoSeleccionado.nombre}`, 15, 55);
  doc.autoTable({
    startY: 65,
    head: [['Concepto', 'Monto Presupuestado', 'Gasto Real', 'Eficiencia']],
    body: [[
      'Financiero',
      `$${proyectoSeleccionado.presupuesto_total || 0}`,
      `$${proyectoSeleccionado.gasto_real_acumulado || 0}`,
      `${((proyectoSeleccionado.gasto_real_acumulado / proyectoSeleccionado.presupuesto_total) * 100 || 0).toFixed(1)}%`
    ]],
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] }
  });
  doc.text("Resumen de Actividades y Stock", 15, doc.lastAutoTable.finalY + 15);
  doc.setFontSize(8);
  doc.text("Este documento es generado automáticamente por el Cerebro WM v1.0", 15, 285);
  doc.save(`Reporte_WM_${proyectoSeleccionado.nombre}_${fecha}.pdf`);
}

function generarReporteEjecutivo(proyectos, periodo = 'semanal') {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();
  const logoImg = new Image();
  logoImg.src = '/logo.png';

  logoImg.onload = function() {
    doc.setFillColor(250, 204, 21);
    doc.rect(0, 0, 210, 30, 'F');
    try {
      doc.addImage(logoImg, 'PNG', 10, 6, 18, 18);
    } catch (e) { console.warn("Logo no encontrado"); }
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text('WM CONSTRUCTORA', 32, 18);
    const tableRows = proyectos.map(p => [
      p.nombre || 'Sin nombre',
      `${p.porcentaje_avance_fisico || 0}%`,
      `$${p.gasto_real_acumulado?.toLocaleString() || 0}`,
      p.estado || 'Activo'
    ]);
    doc.autoTable({
      startY: 40,
      head: [['Proyecto', 'Avance', 'Gastado', 'Estado']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [250, 204, 21], textColor: [0, 0, 0] }
    });
    doc.save(`Reporte_WM_${periodo}_${fecha}.pdf`);
  };
  
  // Fallback if image doesn't load
  logoImg.onerror = function() {
    doc.setFillColor(250, 204, 21);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text('WM CONSTRUCTORA', 15, 18);
    const tableRows = proyectos.map(p => [
      p.nombre || 'Sin nombre',
      `${p.porcentaje_avance_fisico || 0}%`,
      `$${p.gasto_real_acumulado?.toLocaleString() || 0}`,
      p.estado || 'Activo'
    ]);
    doc.autoTable({
      startY: 40,
      head: [['Proyecto', 'Avance', 'Gastado', 'Estado']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [250, 204, 21], textColor: [0, 0, 0] }
    });
    doc.save(`Reporte_WM_${periodo}_${fecha}.pdf`);
  };
}

// --- STOCK VIEWER COMPONENT ---
function StockViewer() {
  const [inventario, setInventario] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    const fetchInventario = async () => {
      if (!supabase) {
        setLoadingStock(false);
        return;
      }
      const { data, error } = await supabase.from('inventario_materiales').select('*,proyectos(nombre)');
      if (!error) setInventario(data || []);
      setLoadingStock(false);
    };
    fetchInventario();
  }, []);

  if (loadingStock) return <p className="text-[10px] animate-pulse">Sincronizando Bodegas...</p>;
  return (
    <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 mt-8">
      <h3 className="text-[11px] font-black uppercase text-[#facc15] tracking-[0.3em] mb-6 italic flex items-center gap-3">
        <Database size={16}/> Estado de Bodegas e Inventario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventario.map((item) => (
          <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{item.proyectos?.nombre}</p>
            <h4 className="text-sm font-bold">{item.nombre_material || item.codigo_sku}</h4>
            <span className="text-[#facc15] font-black text-xs">{item.cantidad_actual} {item.unidad_medida}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- KPI CARD COMPONENT ---
function KpiCard({ title, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
      <div className="text-white/30 mb-4">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{title}</p>
      <h4 className={`text-2xl font-black ${color}`}>{value}</h4>
    </div>
  );
}

// --- NOTIFICATIONS PANEL COMPONENT ---
function NotificacionesPanel() {
  const [alertas, setAlertas] = useState([]);
  useEffect(() => {
    if (!supabase) return;
    const sub = supabase.channel('alertas-vivas').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, payload => {
      setAlertas(prev => [payload.new, ...prev]);
    }).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);
  return (
    <div className="fixed top-20 right-6 w-80 space-y-3 z-50">
      {alertas.map((a, i) => (
        <div key={i} className="bg-red-600 text-white p-4 rounded-2xl shadow-xl border-l-4 border-white">
          <p className="text-[10px] font-black uppercase">¡ALERTA!</p>
          <p className="text-xs">{a.mensaje}</p>
        </div>
      ))}
    </div>
  );
}

// --- MANUAL USUARIO COMPONENT ---
function ManualUsuario() {
  const [mostrarManual, setMostrarManual] = useState(false);
  
  return (
    <div className="mt-8">
      <button 
        onClick={() => setMostrarManual(!mostrarManual)}
        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
      >
        {mostrarManual ? '✕ Cerrar Manual' : '📖 Manual de Usuario'}
      </button>
      
      {mostrarManual && (
        <div className="mt-4 bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
          <h3 className="text-xl font-black text-[#facc15] mb-6">Manual de Usuario - Cerebro WM</h3>
          
          <div className="space-y-6 text-sm">
            <div>
              <h4 className="font-bold text-white/80 mb-2">Vista Administrador</h4>
              <p className="text-white/60">Accede al dashboard completo con KPIs, gráficos de avance y estado de inventario. Puedes generar reportes PDF por proyecto o reportes ejecutivos semanales.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white/80 mb-2">Vista Campo</h4>
              <p className="text-white/60">Registra y visualiza las actividades en terreno. Marca tareas completadas en tiempo real.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white/80 mb-2">Vista Proveedor</h4>
              <p className="text-white/60">Ingresa materiales recibidos con código SKU, cantidad y proyecto asociado.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white/80 mb-2">Importación de Datos</h4>
              <p className="text-white/60">Usa el botón "IMPORTAR PRESUPUESTO CSV" para cargar datos masivos al sistema.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [userRole, setUserRole] = useState('admin');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProyectos() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('proyectos').select('*');
      if (!error) setProyectos(data || []);
      setLoading(false);
    }
    fetchProyectos();

    // Real-time subscription
    if (supabase) {
      const subscription = supabase
        .channel('cambios-proyectos')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' }, fetchProyectos)
        .subscribe();
      return () => supabase.removeChannel(subscription);
    }
  }, []);

  // CSV Import with error handling
  const handleCSVImport = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('archivo', file);
      
      // Note: RAILWAY_API would need to be configured in environment variables
      // For now, this is a placeholder for future implementation
      alert("Función de importación CSV: Requiere configuración de API backend");
    } catch (error) {
      console.error("Error importing CSV:", error);
      alert("Error al importar archivo CSV");
    }
  };

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center font-black">CARGANDO CEREBRO WM...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto bg-black min-h-screen text-white">
      <NotificacionesPanel />
      <nav className="flex justify-between items-center mb-12 bg-[#111] p-6 rounded-3xl border border-white/5">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-[#facc15]">WM CONSTRUCTORA</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Cerebro de Control Central</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setUserRole('admin')} 
            className={`px-4 py-2 rounded-xl text-[10px] font-bold ${userRole === 'admin' ? 'bg-[#facc15] text-black' : 'bg-white/5'}`}
          >
            ADMINISTRADOR
          </button>
          <button 
            onClick={() => setUserRole('campo')} 
            className={`px-4 py-2 rounded-xl text-[10px] font-bold ${userRole === 'campo' ? 'bg-[#facc15] text-black' : 'bg-white/5'}`}
          >
            CAMPO
          </button>
          <button 
            onClick={() => setUserRole('proveedor')} 
            className={`px-4 py-2 rounded-xl text-[10px] font-bold ${userRole === 'proveedor' ? 'bg-[#facc15] text-black' : 'bg-white/5'}`}
          >
            PROVEEDOR
          </button>
        </div>
      </nav>

      {userRole === 'admin' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <KpiCard 
              title="Flujo de Caja" 
              value={`$${proyectos.reduce((acc, p) => {
                const presupuesto = p.presupuesto_total || 0;
                const gasto = p.gasto_real_acumulado || 0;
                return acc + (presupuesto - gasto);
              }, 0).toLocaleString()}`} 
              icon={<Wallet size={20}/>} 
            />
            <KpiCard title="Alertas" value="3 Activas" color="text-red-500" icon={<AlertCircle size={20}/>} />
            <div className="lg:col-span-3 bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between mb-8">
                <h3 className="font-black uppercase tracking-widest text-sm">Avance Físico vs Financiero</h3>
                <label className="cursor-pointer bg-[#facc15] text-black px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
                  <FileUp size={14}/> IMPORTAR PRESUPUESTO CSV
                  <input type="file" hidden onChange={handleCSVImport} accept=".csv" />
                </label>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={proyectos}>
                    <Area type="monotone" dataKey="porcentaje_avance_fisico" stroke="#facc15" fill="#facc15" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="gasto_real_acumulado" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectos.map((proyecto) => (
              <div key={proyecto.id} className="bg-[#222] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white/40">{proyecto.nombre}</p>
                  <p className="text-[10px] text-white/20">ID: {proyecto.id}</p>
                </div>
                <button 
                  onClick={() => generarReportePDF(proyecto)}
                  className="bg-white/5 hover:bg-[#facc15] hover:text-black p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black"
                >
                  <FileText size={14}/> PDF
                </button>
              </div>
            ))}
          </div>
          <StockViewer />
        </>
      )}

      {userRole === 'campo' && (
        <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
          <h2 className="font-black text-xl mb-6 flex items-center gap-3"><HardHat className="text-[#facc15]" /> ACTIVIDADES DE CAMPO</h2>
          <div className="space-y-4">
            {["Cimentación", "Levantamiento de Muros", "Instalación Eléctrica"].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                <span className="font-bold text-sm">{task}</span>
                <CheckCircle2 className="text-white/20 group-hover:text-[#facc15] transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {userRole === 'proveedor' && (
        <div className="max-w-md mx-auto bg-[#111] p-8 rounded-[2.5rem] border border-[#facc15]/20 shadow-2xl shadow-yellow-500/5">
          <h2 className="font-black text-xl mb-6 text-[#facc15]">REGISTRO DE MATERIALES</h2>
          <div className="space-y-4">
            <input className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm" placeholder="Código de Producto (SKU)" />
            <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm" placeholder="Cantidad" />
            <select className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm text-white/50">
              <option>Seleccionar Proyecto...</option>
              {proyectos.map(p => <option key={p.id}>{p.nombre}</option>)}
            </select>
            <button className="w-full bg-[#facc15] text-black font-black p-4 rounded-xl uppercase tracking-widest text-xs mt-4">Enviar al Cerebro WM</button>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <button onClick={() => generarReporteEjecutivo(proyectos, 'semanal')} className="bg-[#facc15] text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase">PDF Semanal</button>
        <button onClick={() => generarReporteEjecutivo(proyectos, 'mensual')} className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase">PDF Mensual</button>
      </div>

      <ManualUsuario />
    </div>
  );
}