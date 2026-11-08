import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  Check, ChevronDown, ChevronRight, ClipboardList, Clock3, CloudRain,
  Command, Compass, FileSearch, Filter, LogOut, MapPin, Menu, MessageSquareText, MoreHorizontal,
  PackageCheck, Search, Settings, ShieldCheck, Truck, UserRound, Users, Copy, Send, Sparkles, X,
} from 'lucide-react'
import DeliveryMap from '../components/dashboard/DeliveryMap'
import { ThemeToggle } from '../hooks/useTheme'
import { api, getStoredUser } from '../api/client'

function getUserProfile() {
  const stored = getStoredUser()
  const name = stored?.name || 'Priya Srinivasan'
  const roleRaw = stored?.role || 'SUPPORT'
  const role = roleRaw === 'ADMIN' ? 'System Administrator' : roleRaw === 'SUPERVISOR' ? 'Logistics Supervisor' : 'Support Agent'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PS'
  const firstName = name.split(' ')[0] || 'Priya'
  return { name, role, initials, firstName }
}

type View = 'Dashboard' | 'Complaints' | 'Investigations' | 'Escalated Cases' | 'Regional Events' | 'Shipment Tracking'
type Complaint = {
  id: string; customer: string; initials: string; order: string; category: string; location: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low'; status: 'New' | 'Investigating' | 'AI Review' | 'Escalated' | 'Resolved';
  agent: string; received: string; age: string; summary: string
}


function mapDtoToComplaint(dto: any): Complaint {
  const customer = dto.customerName || (dto.customerEmail ? dto.customerEmail.split('@')[0] : 'Customer');
  const initials = customer.split(' ').filter(Boolean).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'CU';
  const id = dto.complaintId ? ('CMP-' + dto.complaintId.slice(0, 5).toUpperCase()) : 'CMP-00000';
  const order = dto.orderNumber || dto.extractedOrderId || 'N/A';
  const categoryRaw = dto.complaintType || 'Delayed delivery';
  const category = categoryRaw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
  const location = 'Chennai, TN';
  const priorityRaw = dto.urgency || 'High';
  const priority = priorityRaw.charAt(0).toUpperCase() + priorityRaw.slice(1).toLowerCase();
  const statusRaw = dto.status || 'New';
  const status = statusRaw === 'RECEIVED' ? 'New' : statusRaw === 'INVESTIGATING' ? 'Investigating' : statusRaw === 'RESOLVED' ? 'Resolved' : statusRaw === 'ESCALATED' ? 'Escalated' : 'New';
  const agent = dto.assignedToName && dto.assignedToName !== 'Unassigned' ? dto.assignedToName : 'Unassigned';

  let received = 'Today, 10:00 AM';
  let age = 'Just now';
  if (dto.receivedAt) {
    try {
      const d = new Date(dto.receivedAt);
      received = 'Today, ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const diffMins = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000));
      age = diffMins < 60 ? (diffMins + ' min ago') : (Math.floor(diffMins / 60) + ' hr ago');
    } catch {}
  }

  const summary = dto.emailBody || dto.emailSubject || 'Complaint reported by customer via portal.';

  return {
    id,
    customer,
    initials,
    order,
    category,
    location,
    priority: (['Critical', 'High', 'Medium', 'Low'].includes(priority) ? priority : 'High') as any,
    status: (['New', 'Investigating', 'AI Review', 'Escalated', 'Resolved'].includes(status) ? status : 'New') as any,
    agent,
    received,
    age,
    summary,
  };
}

const complaints: Complaint[] = [];

const navItems: { label: View; icon: typeof Activity; count?: string }[] = [
  { label: 'Dashboard', icon: Command }, { label: 'Complaints', icon: MessageSquareText, count: '24' },
  { label: 'Investigations', icon: FileSearch, count: '12' }, { label: 'Escalated Cases', icon: AlertTriangle, count: '4' },
  { label: 'Regional Events', icon: CloudRain, count: '3' }, { label: 'Shipment Tracking', icon: Truck },
]

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function pathFor(view: View) { return view === 'Dashboard' ? '/' : `/${view.toLowerCase().replaceAll(' ', '-')}` }

function Sidebar({ active, onNavigate, mobileOpen, closeMobile }: { active: View; onNavigate: (view: View) => void; mobileOpen: boolean; closeMobile: () => void }) {
  const user = getUserProfile()
  return <>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={closeMobile} />}
    <aside className={`ops-sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
      <a className="ops-brand" href="/" onClick={(e) => { e.preventDefault(); onNavigate('Dashboard') }}>
        <span className="ops-brand-mark"><PackageCheck size={21} strokeWidth={1.8} /></span>
        <span><b>Logistics Core</b><small>INVESTIGATION PLATFORM</small></span>
      </a>
      <div className="sidebar-workspace"><span className="workspace-label">WORKSPACE</span><button className="workspace-button"><span className="workspace-avatar">S</span><span>South Region<small>Support operations</small></span><ChevronDown size={15} /></button></div>
      <nav className="sidebar-nav" aria-label="Main navigation"><span className="workspace-label">OPERATIONS</span>
        {navItems.map(({ label, icon: Icon, count }) => <a key={label} href={pathFor(label)} onClick={(e) => { e.preventDefault(); onNavigate(label); closeMobile() }} className={`sidebar-link${active === label ? ' active' : ''}`} aria-current={active === label ? 'page' : undefined}>
          <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count && <small>{count}</small>}
        </a>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-status"><span className="live-indicator" /><span>All systems operational</span><ChevronRight size={14} /></div>
        <a className="sidebar-link" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile') }}><UserRound size={17} /><span>My profile</span></a>
        <a className="sidebar-link" href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings') }}><Settings size={17} /><span>Settings</span></a>
        <button className="sidebar-user" onClick={() => navigate('/profile')}><span className="agent-avatar">{user.initials}</span><span><b>{user.name}</b><small>{user.role}</small></span><MoreHorizontal size={17} /></button>
        <button className="sidebar-logout" onClick={() => { localStorage.clear(); window.location.assign('/'); }}><LogOut size={16} /><span>Log out</span></button>
      </div>
    </aside>
  </>
}

function Navbar({ onMenu, onNavigate }: { onMenu: () => void; onNavigate: (view: View) => void }) {
  const user = getUserProfile()
  const [query, setQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  function submitSearch(e: FormEvent) { e.preventDefault(); if (query.trim()) { onNavigate('Shipment Tracking'); navigate(`/shipment-tracking?order=${encodeURIComponent(query.trim())}`) } }
  return <header className="ops-navbar">
    <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button>
    <form className="global-search" onSubmit={submitSearch}><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search complaints, orders, or customers..." aria-label="Search complaints, orders or customers" /><kbd>⌘ K</kbd></form>
    <div className="navbar-right"><span className="navbar-date"><Clock3 size={14} /> Thu, 5 Nov</span>
      <ThemeToggle />
      <div className="notification-wrap"><button className={`icon-button notification-button${showNotifications ? ' is-open' : ''}`} onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell size={18} /><i /></button>
        {showNotifications && <div className="notification-popover"><div className="popover-heading"><b>Notifications</b><span>3 new</span></div><p><AlertTriangle size={15} /> Flood alert updated near Chennai</p><p><MessageSquareText size={15} /> 2 new customer complaints</p><p><Clock3 size={15} /> Investigation CMP-28490 needs review</p></div>}
      </div>
      <button className="navbar-profile" onClick={() => navigate('/profile')}><span className="agent-avatar">{user.initials}</span><span><b>{user.name}</b><small>{user.role}</small></span><ChevronDown size={14} /></button>
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: '#b54738',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 600,
          fontSize: '11px',
          cursor: 'pointer'
        }}
        onClick={() => {
          localStorage.clear();
          window.location.assign('/');
        }}
      >
        <LogOut size={14} />
        <span>Log out</span>
      </button>
    </div>
  </header>
}

function KpiCard({ title, value, detail, trend, icon, tone, onClick }: { title: string; value: string; detail: string; trend?: string; icon: ReactNode; tone: string; onClick: () => void }) {
  return <button className={`kpi-card kpi-${tone}`} onClick={onClick}><span className="kpi-top"><span className="kpi-icon">{icon}</span><ArrowRight className="kpi-arrow" size={16} /></span><span className="kpi-value-row"><b>{value}</b>{trend && <small className="kpi-trend"><ArrowUpRight size={13} />{trend}</small>}</span><span className="kpi-title">{title}</span><span className="kpi-detail">{detail}</span></button>
}

function StatusBadge({ status }: { status: Complaint['status'] }) { return <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}><i />{status}</span> }
function PriorityBadge({ priority }: { priority: Complaint['priority'] }) { return <span className={`priority-badge priority-${priority.toLowerCase()}`}><i />{priority}</span> }

function ComplaintsTable({ rows, onOpen, onViewAll, compact = false }: { rows: Complaint[]; onOpen: (complaint: Complaint) => void; onViewAll?: () => void; compact?: boolean }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(() => new URLSearchParams(window.location.search).get('status') ?? 'All status')
  const [priority, setPriority] = useState('All priorities')
  const [category, setCategory] = useState('All categories')
  const [date, setDate] = useState('All dates')
  const filtered = useMemo(() => rows.filter((c) => {
    const haystack = `${c.id} ${c.customer} ${c.order} ${c.category} ${c.location} ${c.agent}`.toLowerCase()
    const withinDate = date === 'All dates' || date === 'Last 7 days' || (date === 'Today' && c.received.startsWith('Today'))
    return haystack.includes(search.toLowerCase()) && (status === 'All status' || c.status === status) && (priority === 'All priorities' || c.priority === priority) && (category === 'All categories' || c.category === category) && withinDate
  }), [rows, search, status, priority, category, date])
  return <section className={`panel complaint-panel${compact ? ' compact-panel' : ''}`}>
    <div className="panel-heading"><div><span className="section-kicker">CUSTOMER EXPERIENCE</span><h2>{compact ? 'Recent complaints' : 'Customer complaints'} <span className="heading-count">{filtered.length}</span></h2><p>{compact ? 'New cases that need your attention.' : 'Review, search and prioritize incoming customer cases.'}</p></div>{onViewAll && <button className="text-action" onClick={onViewAll}>View all complaints <ArrowRight size={15} /></button>}</div>
    <div className="table-toolbar"><label className="table-search"><Search size={15} /><input placeholder="Search by ID, customer, or order..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search complaints" /><kbd>/</kbd></label>
      {!compact && <div className="filter-controls"><Filter size={15} /><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter complaint status"><option>All status</option>{['New', 'Investigating', 'AI Review', 'Escalated', 'Resolved'].map((v) => <option key={v}>{v}</option>)}</select><select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority"><option>All priorities</option>{['Critical', 'High', 'Medium', 'Low'].map((v) => <option key={v}>{v}</option>)}</select><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"><option>All categories</option>{['Delayed delivery', 'Package not received', 'Damaged package', 'Missed delivery', 'Wrong address'].map((v) => <option key={v}>{v}</option>)}</select><select value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date"><option>All dates</option><option>Today</option><option>Last 7 days</option></select></div>}
    </div>
    <div className="table-scroll"><table className="complaints-table"><thead><tr><th>COMPLAINT ID</th><th>CUSTOMER</th><th>ORDER ID</th><th>CATEGORY</th><th>LOCATION</th><th>PRIORITY</th><th>STATUS</th><th>ASSIGNED AGENT</th><th>RECEIVED</th><th /></tr></thead><tbody>
      {filtered.slice(0, compact ? 5 : undefined).map((c) => <tr key={c.id} onClick={() => onOpen(c)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen(c)}><td className="complaint-id">{c.id}</td><td><span className="customer-cell"><span className="customer-avatar">{c.initials}</span><b>{c.customer}</b></span></td><td className="order-id">{c.order}</td><td>{c.category}</td><td><span className="location-cell"><MapPin size={13} />{c.location}</span></td><td><PriorityBadge priority={c.priority} /></td><td><StatusBadge status={c.status} /></td><td className="agent-cell">{c.agent === 'Unassigned' ? <span className="unassigned">Unassigned</span> : c.agent}</td><td className="received-cell">{c.received}</td><td><button className="row-open" aria-label={`View complaint ${c.id}`} onClick={(e) => { e.stopPropagation(); onOpen(c) }}><ChevronRight size={16} /></button></td></tr>)}
      {filtered.length === 0 && <tr><td colSpan={10} className="empty-state"><Search size={20} /><b>No complaints match these filters</b><span>Try adjusting your search or filters.</span></td></tr>}
    </tbody></table></div>
    {!compact && <div className="table-footer"><span>Showing <b>{filtered.length}</b> of <b>{rows.length}</b> complaints</span><div><button disabled>Previous</button><button className="pagination-current">1</button><button>2</button><button>3</button><button>Next <ChevronRight size={14} /></button></div></div>}
  </section>
}

function ActivityFeed() {
  const feed = [
    { icon: MessageSquareText, tone: 'gold', title: 'New complaint received', detail: 'CMP-28491 · Delayed delivery in Chennai', time: '10:42 AM', who: 'Customer portal' },
    { icon: Activity, tone: 'teal', title: 'AI investigation initiated', detail: 'Order TN-78420319 · 4 evidence sources linked', time: '10:39 AM', who: 'Investigation engine' },
    { icon: CloudRain, tone: 'red', title: 'Regional disruption detected', detail: 'Flood risk elevated near Adyar River basin', time: '10:26 AM', who: 'Regional monitoring' },
    { icon: Users, tone: 'brown', title: 'Case escalated to investigator', detail: 'CMP-28490 · Delivery confirmation mismatch', time: '10:18 AM', who: 'Karthik R.' },
    { icon: Check, tone: 'teal', title: 'Customer response generated', detail: 'CMP-28487 · Address correction confirmed', time: '9:54 AM', who: 'AI-assisted response' },
  ]
  return <section className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">INVESTIGATION LOG</span><h2>Recent activity</h2><p>Latest updates across your region.</p></div><button className="icon-button" aria-label="More activity options"><MoreHorizontal size={18} /></button></div>
    <div className="activity-list">{feed.map(({ icon: Icon, tone, title, detail, time, who }) => <div className="activity-item" key={title}><div className={`activity-icon activity-${tone}`}><Icon size={15} /></div><span className="activity-line" /> <div className="activity-copy"><div><b>{title}</b><time>{time}</time></div><p>{detail}</p><small>{who}</small></div></div>)}</div>
    <button className="activity-link">View activity log <ArrowRight size={15} /></button>
  </section>
}

function QuickActions({ onNavigate }: { onNavigate: (view: View) => void }) {
  const actions: { label: string; description: string; icon: typeof Activity; view: View }[] = [
    { label: 'All complaints', description: 'Review incoming cases', icon: ClipboardList, view: 'Complaints' },
    { label: 'Active investigations', description: 'Track open work', icon: FileSearch, view: 'Investigations' },
    { label: 'Escalated cases', description: 'Needs human review', icon: AlertTriangle, view: 'Escalated Cases' },
    { label: 'Regional events', description: 'Monitor disruptions', icon: Compass, view: 'Regional Events' },
    { label: 'Search shipment', description: 'Look up an order ID', icon: Truck, view: 'Shipment Tracking' },
  ]
  return <section className="quick-actions"><div className="quick-heading"><span className="section-kicker">MOVE WORK FORWARD</span><h2>Quick actions</h2></div><div className="quick-grid">{actions.map(({ label, description, icon: Icon, view }) => <button key={label} className="quick-action" onClick={() => onNavigate(view)}><span className="quick-icon"><Icon size={17} /></span><span><b>{label}</b><small>{description}</small></span><ArrowRight size={15} /></button>)}</div></section>
}

function ComplaintDetail({ complaint, onBack }: { complaint: Complaint; onBack: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [draftSubject, setDraftSubject] = useState(`Delivery Update: QueryX Order ${complaint.order} - Priority Transit Status`);
  const [draftBody, setDraftBody] = useState(
    `Dear ${complaint.customer},\n\nThank you for reaching out to QueryX Support regarding your order ${complaint.order}.\n\nWe sincerely apologize for the delay with your shipment. Our regional logistics investigation confirms your consignment is currently at the ${complaint.location} transit facility.\n\nCurrent Action & Next Steps:\n• Our dispatch team has marked consignment ${complaint.order} as high priority for expedited dispatch.\n• A local delivery representative will contact you directly to confirm doorstep handover.\n\nThank you for your patience and understanding.\n\nWarm regards,\nQueryX Logistics Support Team\nsupport@queryx.in`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(`${draftSubject}\n\n${draftBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setShowModal(false);
      alert(`Customer response draft successfully approved and dispatched to ${complaint.customer}!`);
    }, 1000);
  };

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={onBack}><ChevronRight size={15} /> Back to complaints</button>
      <div className="detail-title-row">
        <div><span className="section-kicker">CASE INVESTIGATION · {complaint.id}</span><h1>{complaint.category}</h1><p>{complaint.summary}</p></div>
        <PriorityBadge priority={complaint.priority} />
      </div>
      <div className="detail-grid">
        <section className="panel detail-main">
          <div className="panel-heading"><div><span className="section-kicker">INVESTIGATION STATUS</span><h2>Case overview</h2></div><StatusBadge status={complaint.status} /></div>
          <div className="detail-timeline">
            <div className="timeline-step done"><i><Check size={13} /></i><span><b>Complaint received</b><small>{complaint.received} · Customer portal</small></span></div>
            <div className="timeline-step done"><i><Check size={13} /></i><span><b>AI investigation started</b><small>Shipment events and regional conditions linked</small></span></div>
            <div className="timeline-step current"><i><Activity size={13} /></i><span><b>Agent review</b><small>Assigned to {complaint.agent}</small></span></div>
            <div className="timeline-step"><i><MessageSquareText size={13} /></i><span><b>Customer response</b><small>Pending investigation outcome</small></span></div>
          </div>
          <div className="detail-actions">
            <button className="primary-action" onClick={() => setShowModal(true)}>
              Draft customer response <Sparkles size={14} />
            </button>
            <button className="secondary-action" onClick={() => alert(`Case ${complaint.id} reassigned to regional investigation team.`)}>
              Reassign case
            </button>
          </div>
        </section>
        <section className="panel detail-facts">
          <div className="panel-heading"><div><span className="section-kicker">SHIPMENT RECORD</span><h2>Customer & order</h2></div></div>
          <dl>
            <div><dt>Customer</dt><dd>{complaint.customer}</dd></div>
            <div><dt>Order ID</dt><dd>{complaint.order}</dd></div>
            <div><dt>Location</dt><dd>{complaint.location}</dd></div>
            <div><dt>Category</dt><dd>{complaint.category}</dd></div>
            <div><dt>Assigned agent</dt><dd>{complaint.agent}</dd></div>
            <div><dt>Received</dt><dd>{complaint.received}</dd></div>
          </dl>
        </section>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Sparkles size={16} color="#92582b" />
                <h3>AI Generated Customer Response</h3>
                <span className="modal-badge">QueryX AI</span>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-evidence-box">
                <b>AI Investigation Summary</b>
                <span>{complaint.summary} Shipment held at {complaint.location} sorting center. Priority courier protocol activated.</span>
              </div>
              <div className="modal-field">
                <label>Email Subject</label>
                <input value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} />
              </div>
              <div className="modal-field">
                <label>Response Body (Editable)</label>
                <textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} rows={9} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? <><Check size={14} color="#15803d" /> Copied!</> : <><Copy size={14} /> Copy Draft</>}
              </button>
              <button className="btn-send" onClick={handleSend} disabled={isSent}>
                {isSent ? <><Check size={14} /> Approved & Dispatched</> : <><Send size={14} /> Approve & Send Response</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const user = getUserProfile()
  const [path, setPath] = useState(window.location.pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(() => complaints.find((c) => `/complaints/${c.id.toLowerCase()}` === window.location.pathname) ?? null)
  useEffect(() => { const listener = () => { setPath(window.location.pathname); setSelectedComplaint(complaints.find((c) => `/complaints/${c.id.toLowerCase()}` === window.location.pathname) ?? null) }; window.addEventListener('popstate', listener); return () => window.removeEventListener('popstate', listener) }, [])
  const active = (navItems.find(({ label }) => path === pathFor(label))?.label ?? 'Dashboard') as View
  const visibleRows = active === 'Investigations' ? complaints.filter((c) => c.status === 'Investigating' || c.status === 'AI Review')
    : active === 'Escalated Cases' ? complaints.filter((c) => c.status === 'Escalated')
      : active === 'Regional Events' ? complaints.filter((c) => ['Chennai, TN', 'Salem, TN', 'Erode, TN'].includes(c.location)) : complaints
  function go(view: View, statusFilter?: string) { setSelectedComplaint(null); const target = `${pathFor(view)}${statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''}`; setPath(pathFor(view)); window.history.pushState({}, '', target) }
  function openComplaint(c: Complaint) { setSelectedComplaint(c); window.history.pushState({}, '', `/complaints/${c.id.toLowerCase()}`); setPath(`/complaints/${c.id.toLowerCase()}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const isDetail = Boolean(selectedComplaint)
  const title = active === 'Dashboard' ? '' : active
  return <div className="ops-app"><Sidebar active={active} onNavigate={go} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} /><div className="ops-main"><Navbar onMenu={() => setMobileOpen(true)} onNavigate={go} /><main className="dashboard-content">
    {path === '/profile' || path === '/settings' ? <section className="panel utility-page"><span className="section-kicker">ACCOUNT</span><h1>{path === '/profile' ? 'My profile' : 'Settings'}</h1><p>{path === '/profile' ? 'Your support operations account.' : 'Manage your dashboard preferences.'}</p><div className="utility-profile"><span className="agent-avatar">{user.initials}</span><div><b>{user.name}</b><small>{user.role} · South Region</small></div></div>{path === '/settings' && <label className="settings-toggle"><input type="checkbox" defaultChecked /> Receive regional disruption notifications</label>}</section> : isDetail && selectedComplaint ? <ComplaintDetail complaint={selectedComplaint} onBack={() => go('Complaints')} /> : active === 'Dashboard' ? <>
      <div className="welcome-row"><div><span className="section-kicker">THURSDAY, 5 NOVEMBER 2026 <i className="kicker-dot" /> SOUTH REGION OPERATIONS</span><h1>Welcome back, <span>{user.firstName}</span></h1><p>Here's an overview of your logistics investigations and customer complaints.</p></div><button className="date-range"><Clock3 size={15} /> Today <ChevronDown size={14} /></button></div>
      <section className="kpi-grid" aria-label="Operations summary">
        <KpiCard title="Total complaints received" value={String(complaintList.length)} detail="Live cases from Supabase DB" trend="12.8%" icon={<MessageSquareText size={18} />} tone="brown" onClick={() => go('Complaints')} />
        <KpiCard title="Open investigations" value={String(complaintList.filter(c => c.status === "Investigating").length)} detail="Under active AI analysis" trend="4.2%" icon={<FileSearch size={18} />} tone="gold" onClick={() => go('Investigations')} />
        <KpiCard title="AI-resolved cases" value={String(complaintList.filter(c => c.status === "Resolved").length)} detail="Automated outcome reached" trend="8.1%" icon={<SparklesIcon />} tone="teal" onClick={() => go('Complaints', 'Resolved')} />
        <KpiCard title="Pending human reviews" value={String(complaintList.filter(c => c.status === "New" || c.status === "Escalated").length)} detail="Needs review" icon={<Users size={18} />} tone="slate" onClick={() => go('Escalated Cases')} />
        <KpiCard title="Critical disruptions" value="03" detail="11 delivery zones affected" icon={<AlertTriangle size={18} />} tone="red" onClick={() => go('Regional Events')} />
        <KpiCard title="Resolved complaints" value={String(complaintList.filter(c => c.status === "Resolved").length)} detail="Closed with outcome" trend="6.4%" icon={<PackageCheck size={18} />} tone="mint" onClick={() => go('Complaints', 'Resolved')} />
      </section>
      <div className="dashboard-grid"><ComplaintsTable rows={complaintList} onOpen={openComplaint} onViewAll={() => go('Complaints')} compact /><DeliveryMap /></div>
      <div className="lower-grid"><ActivityFeed /><QuickActions onNavigate={go} /></div>
      <div className="dashboard-footnote"><ShieldCheck size={14} /> Customer and shipment data is visible to authorized support personnel only.<span>Last synced 2 minutes ago</span></div>
    </> : <>
      <div className="welcome-row listing-welcome"><div><span className="section-kicker">SOUTH REGION OPERATIONS</span><h1>{title}</h1><p>{active === 'Shipment Tracking' ? 'Search shipment progress and related customer cases.' : active === 'Regional Events' ? 'Monitor weather, road and local incidents affecting delivery operations.' : `Review and manage ${title.toLowerCase()} across your region.`}</p></div></div>
      {active === 'Shipment Tracking' && <div className="shipment-search panel"><Search size={20} /><div><b>Find a shipment</b><small>Enter an order ID in the search bar above to see its latest events.</small></div><ArrowDownRight size={18} /></div>}
      {active === 'Regional Events' && <DeliveryMap />}
      {active === 'Regional Events' && <section className="panel regional-event-list"><div className="panel-heading"><div><span className="section-kicker">ACTIVE INCIDENTS</span><h2>Events affecting delivery</h2></div></div>{['Chennai flood watch · Adyar River basin · 8 zones at risk','Salem corridor closure · NH 544 · +4 hr transit','Coastal rain band · Cuddalore · 3 hubs monitoring'].map((item) => <div className="regional-event-row" key={item}><AlertTriangle size={17} /><span>{item}</span><span className="event-active">Monitoring</span></div>)}</section>}
      {active !== 'Regional Events' && <ComplaintsTable rows={visibleRows} onOpen={openComplaint} />}
      {active === 'Shipment Tracking' && <section className="panel tracking-hint"><Truck size={20} /><b>Shipment tracking demo</b><p>Use the order search above to find a shipment. Sample order IDs include TN-78420319 and TN-78419852.</p></section>}
    </>}
  </main></div></div>
}

function SparklesIcon() { return <Activity size={18} /> }
