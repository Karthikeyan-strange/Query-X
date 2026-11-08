import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, Bell, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleHelp, Clock3, FileText, Inbox, LifeBuoy, LogOut, Mail, MapPin, Menu,
  MessageCircle, MessageSquareText, Package, Paperclip, Plus, Search, Send,
  Settings, ShieldCheck, Truck, UserRound, X,
} from 'lucide-react'
import {
  customerAccounts, type CustomerAccount, type CustomerComplaintCategory,
  type CustomerOrder, type CustomerTicket, type CustomerTicketStatus, type TicketAttachment,
  type TicketMessage,
} from '../data/customerPortalData'
import { ThemeToggle } from '../hooks/useTheme'

type Section = 'Dashboard' | 'My Orders' | 'Raise a Complaint' | 'My Support Tickets' | 'Notifications' | 'Profile & Settings'
const categories: CustomerComplaintCategory[] = ['Delayed Delivery', 'Shipment Not Updated', 'Package Not Delivered', 'Damaged Package', 'Incorrect Delivery Status', 'Other']
const sections: { label: Section; icon: typeof Inbox }[] = [
  { label: 'Dashboard', icon: Inbox }, { label: 'My Orders', icon: Package },
  { label: 'Raise a Complaint', icon: Plus }, { label: 'My Support Tickets', icon: MessageSquareText },
  { label: 'Notifications', icon: Bell }, { label: 'Profile & Settings', icon: Settings },
]

function formatDate(value: string, withTime = false) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', withTime
    ? { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function fileSize(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB` }

function CustomerBrand({ small = false, onHome }: { small?: boolean; onHome?: () => void }) {
  const content = <><span className="customer-brand-mark"><Truck size={20} /></span><span><b>Logistics Core</b><small>Customer support</small></span></>
  return onHome ? <button className={`customer-brand${small ? ' customer-brand-small' : ''}`} onClick={onHome} aria-label="Go to customer support home">{content}</button> : <a className={`customer-brand${small ? ' customer-brand-small' : ''}`} href="/" aria-label="Logistics Core customer support home">{content}</a>
}

function StatusChip({ status }: { status: CustomerTicketStatus }) {
  const labels: Record<CustomerTicketStatus, string> = { RECEIVED: 'Received', PROCESSING: 'Processing', INVESTIGATING: 'Investigating', AWAITING_CUSTOMER: 'Awaiting your reply', ESCALATED: 'Escalated', RESOLVED: 'Resolved', CLOSED: 'Closed' }
  return <span className={`customer-status status-${status.toLowerCase()}`}><i />{labels[status]}</span>
}

function CustomerSidebar({ active, onNavigate, onLogout, unread, mobileOpen, closeMobile, name }: { active: Section; onNavigate: (section: Section) => void; onLogout: () => void; unread: number; mobileOpen: boolean; closeMobile: () => void; name: string }) {
  return <><button className={`customer-scrim${mobileOpen ? ' is-visible' : ''}`} aria-label="Close navigation" onClick={closeMobile} /><aside className={`customer-sidebar${mobileOpen ? ' is-open' : ''}`}><CustomerBrand onHome={() => onNavigate('Dashboard')} /><div className="customer-sidebar-caption">YOUR ACCOUNT</div><nav aria-label="Customer navigation">{sections.map(({ label, icon: Icon }) => <button key={label} className={`customer-nav-item${active === label ? ' selected' : ''}`} onClick={() => { onNavigate(label); closeMobile() }}><Icon size={17} /><span>{label}</span>{label === 'Notifications' && unread > 0 && <small>{unread}</small>}</button>)}</nav><div className="customer-sidebar-bottom"><div className="customer-help-card"><span><LifeBuoy size={16} /></span><b>Need a hand?</b><p>Our support team is here to help with your delivery.</p><button onClick={() => onNavigate('Raise a Complaint')}>Contact support <ArrowRight size={13} /></button></div><button className="customer-account-button" onClick={() => onNavigate('Profile & Settings')}><span className="customer-avatar">{name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><b>{name}</b><small>Preview account</small></span><ChevronDown size={15} /></button><button className="customer-logout" onClick={onLogout}><LogOut size={15} /> Log out</button></div></aside></>
}

function CustomerTopbar({ onMenu, unread, onNotifications, name }: { onMenu: () => void; unread: number; onNotifications: () => void; name: string }) {
  return <header className="customer-topbar"><button className="customer-menu-button" onClick={onMenu} aria-label="Open customer navigation"><Menu size={20} /></button><div className="topbar-greeting"><span>Customer support</span><small>Welcome back, {name.split(' ')[0]}</small></div><div className="customer-topbar-actions"><ThemeToggle /><button className="topbar-notification" onClick={onNotifications} aria-label={`${unread} unread support responses`}><Bell size={18} />{unread > 0 && <i>{unread}</i>}</button><span className="topbar-divider" /><span className="topbar-avatar">{name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span></div></header>
}

function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="customer-page-title"><div><span className="portal-kicker">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>
}

function MetricCard({ icon, label, value, note, tone }: { icon: ReactNode; label: string; value: string; note: string; tone: string }) {
  return <article className={`customer-metric metric-${tone}`}><span className="metric-icon">{icon}</span><span className="metric-value">{value}</span><b>{label}</b><small>{note}</small></article>
}

function OrderStatus({ status }: { status: string }) { const delivered = status.toLowerCase().includes('delivered'); return <span className={`order-state${delivered ? ' order-delivered' : status.toLowerCase().includes('delay') ? ' order-delayed' : ''}`}><i />{status}</span> }

function OrderCard({ order, onOpen }: { order: CustomerOrder; onOpen: (order: CustomerOrder) => void }) {
  const nextEvent = order.events.find((event) => !event.complete)
  return <button className="customer-order-card" onClick={() => onOpen(order)}><span className="order-card-top"><span className="order-icon"><Package size={17} /></span><span className="order-status-wrap"><OrderStatus status={order.status} /><ChevronRight size={16} /></span></span><span className="order-card-id">{order.id}</span><span className="order-courier">{order.courier}</span><span className="order-card-foot"><span>{nextEvent ? nextEvent.title : order.eta}</span><ArrowRight size={14} /></span></button>
}

function TicketRow({ ticket, onOpen, compact = false }: { ticket: CustomerTicket; onOpen: (ticket: CustomerTicket) => void; compact?: boolean }) {
  const unread = ticket.messages.some((message) => message.unread && message.role !== 'Customer')
  return <button className={`customer-ticket-row${unread ? ' ticket-unread' : ''}${compact ? ' ticket-row-compact' : ''}`} onClick={() => onOpen(ticket)}><span className="ticket-row-icon"><MessageCircle size={17} />{unread && <i />}</span><span className="ticket-row-main"><span className="ticket-subject-line"><b>{ticket.subject}</b><StatusChip status={ticket.status} /></span><small>{ticket.id} <i /> Order {ticket.orderId} <i /> {ticket.category}</small><span className="ticket-preview">{ticket.preview}</span></span><span className="ticket-row-date">{formatDate(ticket.lastResponseAt, true)}<ChevronRight size={15} /></span></button>
}

function DashboardHome({ account, tickets, orders, onNavigate, onOpenTicket, onOpenOrder }: { account: CustomerAccount; tickets: CustomerTicket[]; orders: CustomerOrder[]; onNavigate: (section: Section) => void; onOpenTicket: (ticket: CustomerTicket) => void; onOpenOrder: (order: CustomerOrder) => void }) {
  const awaiting = tickets.filter((ticket) => ['RECEIVED', 'PROCESSING', 'INVESTIGATING', 'ESCALATED'].includes(ticket.status)).length
  const resolved = tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length
  const active = tickets.filter((ticket) => !['RESOLVED', 'CLOSED'].includes(ticket.status)).length
  return <>
    <PageTitle eyebrow="YOUR DELIVERY ACCOUNT" title={`Welcome back, ${account.name.split(' ')[0]}`} subtitle="Your orders and support conversations, together in one place." action={<button className="portal-primary title-action" onClick={() => onNavigate('Raise a Complaint')}><Plus size={17} /> Raise a complaint</button>} />
    <div className="customer-metrics"><MetricCard icon={<Package size={18} />} label="Total orders" value={String(orders.length)} note="Linked to this account" tone="brown" /><MetricCard icon={<MessageSquareText size={18} />} label="Active complaints" value={String(active)} note="Being reviewed by our team" tone="gold" /><MetricCard icon={<Clock3 size={18} />} label="Awaiting responses" value={String(awaiting)} note="Support team is reviewing" tone="orange" /><MetricCard icon={<CheckCircle2 size={18} />} label="Resolved complaints" value={String(resolved)} note="Closed with an outcome" tone="teal" /></div>
    <div className="customer-home-grid"><section className="customer-panel recent-orders"><div className="customer-panel-head"><div><span className="portal-kicker">SHIPMENT OVERVIEW</span><h2>Recent orders</h2><p>Track the latest movement on your deliveries.</p></div><button className="portal-text-link" onClick={() => onNavigate('My Orders')}>All orders <ArrowRight size={15} /></button></div><div className="recent-order-list">{orders.slice(0, 2).map((order) => <OrderCard key={order.id} order={order} onOpen={onOpenOrder} />)}</div></section><section className="customer-panel response-card"><span className="response-icon"><Inbox size={18} /></span><span className="portal-kicker">SUPPORT INBOX</span><h2>{awaiting ? 'A reply is waiting for you' : 'You’re all caught up'}</h2><p>{awaiting ? 'Your support agent has sent an update on an open ticket. Reply in the conversation to keep things moving.' : 'We’ll let you know here when your support team replies.'}</p>{awaiting && <button className="portal-secondary" onClick={() => onOpenTicket(tickets.find((ticket) => ticket.status === 'AWAITING_CUSTOMER')!)}>View reply <ArrowRight size={15} /></button>}</section></div>
    <section className="customer-panel recent-conversations"><div className="customer-panel-head"><div><span className="portal-kicker">YOUR SUPPORT HISTORY</span><h2>Recent conversations</h2><p>Replies and updates stay together under each ticket.</p></div><button className="portal-text-link" onClick={() => onNavigate('My Support Tickets')}>All tickets <ArrowRight size={15} /></button></div><div className="ticket-list">{tickets.slice(0, 3).map((ticket) => <TicketRow key={ticket.id} ticket={ticket} onOpen={onOpenTicket} compact />)}</div></section>
    <div className="customer-privacy-note"><ShieldCheck size={15} /> Preview mode: sample orders and tickets are shown for interface testing.</div>
  </>
}

function OrdersPage({ orders, onOpenOrder }: { orders: CustomerOrder[]; onOpenOrder: (order: CustomerOrder) => void }) {
  const [query, setQuery] = useState('')
  const filtered = orders.filter((order) => `${order.id} ${order.trackingNumber} ${order.status} ${order.lastLocation}`.toLowerCase().includes(query.toLowerCase()))
  return <><PageTitle eyebrow="SHIPMENT HISTORY" title="My orders" subtitle="Track your shipments and see their latest customer-safe updates." /><div className="orders-toolbar"><label><Search size={16} /><input placeholder="Search order ID or tracking number" value={query} onChange={(e) => setQuery(e.target.value)} /></label><span>{filtered.length} orders</span></div><div className="customer-order-grid">{filtered.map((order) => <OrderCard key={order.id} order={order} onOpen={onOpenOrder} />)}{!filtered.length && <div className="portal-empty"><Package size={23} /><b>No matching orders</b><span>Try another order or tracking number.</span></div>}</div></>
}

function ComplaintForm({ account, orders, initialOrderId, onSubmit, onCancel }: { account: CustomerAccount; orders: CustomerOrder[]; initialOrderId?: string; onSubmit: (ticket: CustomerTicket) => void; onCancel: () => void }) {
  const [orderId, setOrderId] = useState(() => orders.some((order) => order.id === initialOrderId) ? initialOrderId! : orders[0]?.id ?? '')
  const [category, setCategory] = useState<CustomerComplaintCategory>('Delayed Delivery')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const [error, setError] = useState('')
  function attachFiles(files: FileList | null) {
    if (!files) return
    const next = Array.from(files)
    if (next.some((file) => file.size > 10 * 1024 * 1024)) { setError('Each attachment must be smaller than 10 MB.'); return }
    setAttachments((current) => [...current, ...next.map(({ name, size }) => ({ name, size }))]); setError('')
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const now = new Date().toISOString()
    const ticketId = `TKT-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const message: TicketMessage = { id: `${ticketId}-1`, sender: account.name, role: 'Customer', sentAt: now, body: description.trim(), attachments: attachments.length ? attachments : undefined }
    onSubmit({ id: ticketId, orderId, subject: subject.trim(), category, submittedAt: now, lastResponseAt: now, status: 'RECEIVED', preview: description.trim(), messages: [message] })
  }
  return <><PageTitle eyebrow="CUSTOMER CARE" title="Raise a complaint" subtitle="Tell us what happened. We’ll link your request to the shipment and keep the conversation here." /><form className="customer-panel complaint-form" onSubmit={submit}><div className="complaint-form-heading"><span className="complaint-form-icon"><MessageSquareText size={18} /></span><div><b>Tell us about the issue</b><small>Required fields are marked with an asterisk.</small></div></div><div className="form-grid"><label>Order ID <em>*</em><select value={orderId} onChange={(e) => setOrderId(e.target.value)} required>{orders.map((order) => <option key={order.id} value={order.id}>{order.id} · {order.status}</option>)}</select></label><label>Complaint category <em>*</em><select value={category} onChange={(e) => setCategory(e.target.value as CustomerComplaintCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Customer name<input value={account.name} readOnly /></label><label>Registered email<input value={account.email} readOnly /></label><label className="form-span-2">Subject <em>*</em><input required minLength={4} maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A short summary of the issue" /></label><label className="form-span-2">Describe what happened <em>*</em><textarea required minLength={10} maxLength={3000} rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Share the details that will help us understand your delivery concern." /><small className="field-hint">Include any recent tracking updates or delivery instructions that may help.</small></label><div className="form-span-2 attachment-control"><label className="attachment-picker"><input type="file" multiple accept="image/*,.pdf,.txt,.doc,.docx" onChange={(e) => attachFiles(e.target.files)} /><Paperclip size={16} /> Add an attachment <small>Images or documents, up to 10 MB each</small></label>{attachments.length > 0 && <div className="attachment-list">{attachments.map((file, index) => <span key={`${file.name}-${index}`}><FileText size={14} />{file.name}<small>{fileSize(file.size)}</small><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))}><X size={13} /></button></span>)}</div>}</div></div>{error && <p className="portal-error" role="alert">{error}</p>}<div className="complaint-form-foot"><p><ShieldCheck size={15} /> We’ll use your details only to support this order and ticket.</p><div><button className="portal-quiet" type="button" onClick={onCancel}>Cancel</button><button className="portal-primary" type="submit">Submit complaint <ArrowRight size={16} /></button></div></div></form></>
}

function SubmissionConfirmation({ ticket, order, onOpenTicket, onRaiseAnother }: { ticket: CustomerTicket; order?: CustomerOrder; onOpenTicket: () => void; onRaiseAnother: () => void }) {
  return <section className="submission-confirmation customer-panel"><span className="confirmation-mark"><Check size={25} /></span><span className="portal-kicker">REQUEST RECEIVED</span><h1>Your complaint is in the right place.</h1><p>We’ve created a support ticket and linked it to your order. Any updates will be sent by email and appear in your ticket conversation.</p><div className="confirmation-facts"><div><small>TICKET ID</small><b>{ticket.id}</b></div><div><small>ORDER ID</small><b>{ticket.orderId}</b></div><div><small>CREATED</small><b>{formatDate(ticket.submittedAt, true)}</b></div><div><small>STATUS</small><StatusChip status={ticket.status} /></div></div>{order && <div className="response-expectation"><Clock3 size={17} /><span><b>What happens next</b><small>A support specialist will review your request. We’ll email you when there’s an update, and you can reply here at any time.</small></span></div>}<div className="confirmation-actions"><button className="portal-primary" onClick={onOpenTicket}>Open ticket conversation <ArrowRight size={16} /></button><button className="portal-quiet" onClick={onRaiseAnother}>Raise another complaint</button></div></section>
}

function TicketListPage({ tickets, onOpenTicket, onNewComplaint }: { tickets: CustomerTicket[]; onOpenTicket: (ticket: CustomerTicket) => void; onNewComplaint: () => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [sort, setSort] = useState('Newest first')
  const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.id} ${ticket.orderId} ${ticket.subject} ${ticket.category} ${ticket.preview}`.toLowerCase().includes(query.toLowerCase()) && (status === 'All statuses' || ticket.status === status)).sort((a, b) => sort === 'Newest first' ? b.submittedAt.localeCompare(a.submittedAt) : a.submittedAt.localeCompare(b.submittedAt)), [tickets, query, status, sort])
  return <><PageTitle eyebrow="SUPPORT INBOX" title="My support tickets" subtitle="Every question and reply stays together in its own email-style thread." action={<button className="portal-primary title-action" onClick={onNewComplaint}><Plus size={16} /> New complaint</button>} /><section className="customer-panel ticket-page-panel"><div className="tickets-toolbar"><label><Search size={16} /><input placeholder="Search tickets, orders, or subjects" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter tickets by status"><option>All statuses</option>{(['RECEIVED', 'PROCESSING', 'INVESTIGATING', 'AWAITING_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED'] as CustomerTicketStatus[]).map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tickets"><option>Newest first</option><option>Oldest first</option></select></div><div className="ticket-list">{filtered.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} onOpen={onOpenTicket} />)}{filtered.length === 0 && <div className="portal-empty"><Search size={23} /><b>No tickets found</b><span>Change the filters or search for another ticket.</span></div>}</div><div className="ticket-list-foot">{filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'} shown</div></section></>
}

function ProgressSteps({ ticket }: { ticket: CustomerTicket }) {
  const steps = ['Complaint received', 'Order verified', 'AI investigation', 'Human review', 'Response sent', 'Resolved']
  const activeStep = ['RECEIVED', 'PROCESSING', 'INVESTIGATING'].includes(ticket.status) ? 2 : ticket.status === 'ESCALATED' ? 3 : ['AWAITING_CUSTOMER', 'RESOLVED', 'CLOSED'].includes(ticket.status) ? 4 : 2
  const completed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
  const responseSent = ticket.messages.some((message) => message.role === 'Support Agent')
  return <div className="investigation-progress"><div className="progress-header"><span className="portal-kicker">CUSTOMER-SAFE PROGRESS</span><span>{completed ? 'Complete' : 'In progress'}</span></div><div className="progress-steps">{steps.map((step, index) => {
    const skippedHumanReview = index === 3 && ticket.status !== 'ESCALATED'
    const isDone = (completed && !skippedHumanReview) || index === 0 || index === 1 || (index < activeStep && !skippedHumanReview) || (index === 2 && activeStep > 2) || (index === 4 && responseSent)
    const isCurrent = !completed && index === activeStep
    return <div className={`progress-step${isDone ? ' step-done' : ''}${isCurrent ? ' step-current' : ''}${skippedHumanReview ? ' step-optional' : ''}`} key={step}><span className="progress-node">{isDone ? <Check size={12} /> : index + 1}</span><span>{step}{skippedHumanReview && <small>If needed</small>}</span></div>
  })}</div></div>
}

function Attachments({ files }: { files?: TicketAttachment[] }) {
  if (!files?.length) return null
  return <div className="message-attachments">{files.map((file) => <span key={file.name}><FileText size={15} /><span><b>{file.name}</b><small>{fileSize(file.size)}</small></span></span>)}</div>
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const customer = message.role === 'Customer'
  const ai = message.role === 'AI Assistant'
  return <article className={`conversation-message${customer ? ' message-customer' : ' message-support'}${ai ? ' message-ai' : ''}`}><span className={`message-avatar${customer ? ' avatar-customer' : ai ? ' avatar-ai' : ' avatar-agent'}`}>{customer ? <UserRound size={15} /> : ai ? <MessageCircle size={15} /> : 'PS'}</span><div className="message-body"><header><span><b>{message.sender}</b><small>{message.role}</small></span><time>{formatDate(message.sentAt, true)}</time></header><div className="message-content">{message.body.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>)}</div><Attachments files={message.attachments} /></div></article>
}

function ReplyComposer({ onSend }: { onSend: (body: string, attachments?: TicketAttachment[]) => void }) {
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const [error, setError] = useState('')
  function send(event: FormEvent) { event.preventDefault(); if (!body.trim()) { setError('Write a message before sending your reply.'); return } onSend(body.trim(), attachments.length ? attachments : undefined); setBody(''); setAttachments([]); setError('') }
  function attach(files: FileList | null) { if (!files) return; const next = Array.from(files); if (next.some((file) => file.size > 10 * 1024 * 1024)) { setError('Each attachment must be smaller than 10 MB.'); return }; setAttachments((current) => [...current, ...next.map(({ name, size }) => ({ name, size }))]); setError('') }
  return <form className="reply-composer" onSubmit={send}><label className="reply-label" htmlFor="reply-message">Reply to this conversation</label><textarea id="reply-message" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply to your support team…" />{attachments.length > 0 && <div className="attachment-list reply-attachment-list">{attachments.map((file, index) => <span key={`${file.name}-${index}`}><FileText size={14} />{file.name}<small>{fileSize(file.size)}</small><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))}><X size={13} /></button></span>)}</div>}{error && <p className="portal-error" role="alert">{error}</p>}<div className="reply-composer-actions"><label className="reply-attach"><input type="file" multiple accept="image/*,.pdf,.txt,.doc,.docx" onChange={(e) => attach(e.target.files)} /><Paperclip size={16} /> Attach file</label><span>Replies stay in ticket {`•`}</span><button className="portal-primary" type="submit"><Send size={15} /> Send reply</button></div></form>
}

function ConversationWorkspace({ ticket, order, onBack, onSend }: { ticket: CustomerTicket; order?: CustomerOrder; onBack: () => void; onSend: (body: string, attachments?: TicketAttachment[]) => void }) {
  return <div className="conversation-page"><button className="conversation-back" onClick={onBack}><ArrowLeft size={15} /> All support tickets</button><div className="conversation-heading"><div><span className="portal-kicker">TICKET {ticket.id}</span><h1>{ticket.subject}</h1><p><span>Order <b>{ticket.orderId}</b></span><i /> {ticket.category} <i /> Opened {formatDate(ticket.submittedAt)}</p></div><StatusChip status={ticket.status} /></div><ProgressSteps ticket={ticket} /><div className="conversation-layout"><section className="customer-panel conversation-panel"><div className="conversation-panel-head"><div><span className="portal-kicker">EMAIL THREAD</span><h2>Conversation</h2></div><span className="thread-count">{ticket.messages.length} messages</span></div><div className="conversation-messages">{ticket.messages.map((message) => <MessageBubble key={message.id} message={message} />)}</div>{ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' ? <ReplyComposer onSend={onSend} /> : <div className="conversation-closed"><CheckCircle2 size={17} /> This conversation is {ticket.status.toLowerCase()}. If you need more help, raise a new complaint.</div>}</section><aside className="conversation-aside"><section className="customer-panel shipment-panel"><div className="aside-panel-heading"><span className="aside-icon"><Truck size={17} /></span><span><small>SHIPMENT DETAILS</small><b>Your order</b></span></div>{order ? <><dl className="shipment-facts"><div><dt>Order ID</dt><dd>{order.id}</dd></div><div><dt>Tracking number</dt><dd>{order.trackingNumber}</dd></div><div><dt>Courier</dt><dd>{order.courier}</dd></div><div><dt>Current status</dt><dd><OrderStatus status={order.status} /></dd></div><div><dt>Estimated delivery</dt><dd>{order.eta}</dd></div><div><dt>Last known location</dt><dd><MapPin size={12} />{order.lastLocation}</dd></div></dl><div className="shipment-timeline"><b>Tracking updates</b>{order.events.map((event) => <div className={`shipment-event${event.complete ? ' event-complete' : ''}`} key={`${event.date}-${event.title}`}><i /><span><b>{event.title}</b><small>{event.location} · {formatDate(event.date, true)}</small><p>{event.description}</p></span></div>)}</div></> : <p className="shipment-missing">Order details are not available for this ticket.</p>}</section><section className="customer-panel ticket-info-panel"><span className="portal-kicker">TICKET DETAILS</span><dl><div><dt>Ticket ID</dt><dd>{ticket.id}</dd></div><div><dt>Submitted</dt><dd>{formatDate(ticket.submittedAt)}</dd></div><div><dt>Last response</dt><dd>{formatDate(ticket.lastResponseAt, true)}</dd></div></dl><p><ShieldCheck size={14} /> Only customer-safe investigation updates are shown here.</p></section></aside></div></div>
}

function NotificationsPage({ tickets, onOpenTicket, enabled, onToggle }: { tickets: CustomerTicket[]; onOpenTicket: (ticket: CustomerTicket) => void; enabled: boolean; onToggle: () => void }) {
  const notifications = tickets.flatMap((ticket) => ticket.messages.filter((message) => message.role !== 'Customer').map((message) => ({ ticket, message }))).sort((a, b) => b.message.sentAt.localeCompare(a.message.sentAt))
  return <><PageTitle eyebrow="EMAIL UPDATES" title="Notifications" subtitle="Support replies and ticket activity for your sample orders." /><section className="customer-panel notification-settings"><span className="settings-mail-icon"><Mail size={18} /></span><span><b>Email notifications</b><small>Get an email when a support agent replies to one of your tickets.</small></span><button className={`preference-switch${enabled ? ' switch-on' : ''}`} role="switch" aria-checked={enabled} aria-label="Email notification preference" onClick={onToggle}><i /></button></section><section className="customer-panel notification-list-panel"><div className="customer-panel-head"><div><span className="portal-kicker">RECENT ACTIVITY</span><h2>Support replies</h2></div><span className="thread-count">{notifications.length} updates</span></div>{notifications.map(({ ticket, message }) => <button key={message.id} className={`notification-row${message.unread ? ' notification-unread' : ''}`} onClick={() => onOpenTicket(ticket)}><span className="notification-icon"><Mail size={16} /></span><span><b>{message.sender} replied to {ticket.id}</b><small>{ticket.subject}</small><small>{message.body}</small></span><time>{formatDate(message.sentAt, true)}</time><ChevronRight size={15} /></button>)}</section></>
}

function ProfilePage({ account, notificationsEnabled, onToggle }: { account: CustomerAccount; notificationsEnabled: boolean; onToggle: () => void }) {
  return <><PageTitle eyebrow="ACCOUNT PREFERENCES" title="Profile and settings" subtitle="Sample contact details and customer portal preferences." /><section className="customer-panel profile-card"><div className="profile-card-head"><span className="profile-large-avatar">{account.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><h2>{account.name}</h2><span><CheckCircle2 size={14} /> Preview account</span></div></div><div className="profile-details"><label>Registered email<input value={account.email} readOnly /></label><label>Account verification<input value="Preview mode, verification disabled" readOnly /></label></div></section><section className="customer-panel profile-preferences"><span className="portal-kicker">COMMUNICATION</span><h2>Email notifications</h2><p>Receive an email when the support team replies to a ticket.</p><label className="preference-row"><span><Mail size={17} /><span><b>Support ticket updates</b><small>Replies, status changes and resolution notices</small></span></span><input type="checkbox" checked={notificationsEnabled} onChange={onToggle} /></label></section></>
}

export default function CustomerPortal() {
  const [account] = useState<CustomerAccount>(customerAccounts[0])
  const [orders] = useState<CustomerOrder[]>(() => account.orders.map((order) => ({ ...order, events: [...order.events] })))
  const [tickets, setTickets] = useState<CustomerTicket[]>(() => account.tickets.map((ticket) => ({ ...ticket, messages: ticket.messages.map((message) => ({ ...message, unread: Boolean(message.unread) })) })))
  const [section, setSection] = useState<Section>('Dashboard')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [complaintOrderId, setComplaintOrderId] = useState('')
  const [confirmationTicketId, setConfirmationTicketId] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const unreadCount = tickets.reduce((total, ticket) => total + ticket.messages.filter((message) => message.unread && message.role !== 'Customer').length, 0)
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId)
  const selectedOrder = orders.find((order) => order.id === selectedOrderId)
  const confirmationTicket = tickets.find((ticket) => ticket.id === confirmationTicketId)

  function openTicket(ticket: CustomerTicket) {
    setTickets((current) => current.map((item) => item.id === ticket.id ? { ...item, messages: item.messages.map((message) => ({ ...message, unread: false })) } : item))
    setSelectedTicketId(ticket.id); setConfirmationTicketId(''); setSelectedOrderId(''); setSection('My Support Tickets')
  }
  function openOrder(order: CustomerOrder) { setSelectedOrderId(order.id); setComplaintOrderId(order.id); setSelectedTicketId(''); setSection('My Orders') }
  function submitTicket(ticket: CustomerTicket) { setTickets((current) => [ticket, ...current]); setSelectedTicketId(''); setComplaintOrderId(''); setConfirmationTicketId(ticket.id); setSection('Raise a Complaint') }
  function sendReply(body: string, attachments?: TicketAttachment[]) {
    if (!selectedTicketId || !account) return
    const now = new Date().toISOString()
    const message: TicketMessage = { id: `${selectedTicketId}-${Date.now()}`, sender: account.name, role: 'Customer', sentAt: now, body, attachments }
    setTickets((current) => current.map((ticket) => ticket.id === selectedTicketId ? { ...ticket, status: 'PROCESSING', lastResponseAt: now, preview: body, messages: [...ticket.messages, message] } : ticket))
  }
  function logout() { localStorage.clear(); window.location.assign('/'); }
  function navigateSection(next: Section) { setSection(next); setSelectedTicketId(''); setSelectedOrderId(''); setConfirmationTicketId('') }
  const showTicket = Boolean(selectedTicket)

  return <div className="customer-portal"><CustomerSidebar active={section} onNavigate={navigateSection} onLogout={logout} unread={unreadCount} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} name={account.name} /><div className="customer-main"><CustomerTopbar onMenu={() => setMobileOpen(true)} unread={unreadCount} onNotifications={() => navigateSection('Notifications')} name={account.name} /><main className="customer-content" id="customer-main">
    {showTicket && selectedTicket ? <ConversationWorkspace ticket={selectedTicket} order={orders.find((order) => order.id === selectedTicket.orderId)} onBack={() => { setSelectedTicketId(''); setSection('My Support Tickets') }} onSend={sendReply} />
      : selectedOrder ? <OrderDetailPage order={selectedOrder} onBack={() => setSelectedOrderId('')} onRaiseComplaint={() => { setComplaintOrderId(selectedOrder.id); setSelectedOrderId(''); setSection('Raise a Complaint') }} />
        : section === 'Dashboard' ? <DashboardHome account={account} tickets={tickets} orders={orders} onNavigate={(next) => { setSection(next); setConfirmationTicketId('') }} onOpenTicket={openTicket} onOpenOrder={openOrder} />
          : section === 'My Orders' ? <OrdersPage orders={orders} onOpenOrder={openOrder} />
            : section === 'Raise a Complaint' ? confirmationTicket ? <SubmissionConfirmation ticket={confirmationTicket} order={orders.find((order) => order.id === confirmationTicket.orderId)} onOpenTicket={() => openTicket(confirmationTicket)} onRaiseAnother={() => setConfirmationTicketId('')} /> : <ComplaintForm account={account} orders={orders} initialOrderId={complaintOrderId} onSubmit={submitTicket} onCancel={() => setSection('Dashboard')} />
              : section === 'My Support Tickets' ? <TicketListPage tickets={tickets} onOpenTicket={openTicket} onNewComplaint={() => setSection('Raise a Complaint')} />
                : section === 'Notifications' ? <NotificationsPage tickets={tickets} onOpenTicket={openTicket} enabled={notificationsEnabled} onToggle={() => setNotificationsEnabled((value) => !value)} />
                  : <ProfilePage account={account} notificationsEnabled={notificationsEnabled} onToggle={() => setNotificationsEnabled((value) => !value)} />}
    </main><footer className="customer-footer"><span>Logistics Core Customer Care</span><span>Preview mode uses sample order and ticket information only.</span><a href="mailto:support@example.in"><CircleHelp size={14} /> Help</a></footer></div></div>
}

function OrderDetailPage({ order, onBack, onRaiseComplaint }: { order: CustomerOrder; onBack: () => void; onRaiseComplaint: () => void }) {
  return <div className="order-detail-page"><button className="conversation-back" onClick={onBack}><ArrowLeft size={15} /> All orders</button><PageTitle eyebrow="SHIPMENT TRACKING" title={order.id} subtitle={`Tracking number ${order.trackingNumber} · ${order.courier}`} action={<button className="portal-secondary" onClick={onRaiseComplaint}><MessageSquareText size={15} /> Get help with this order</button>} /><div className="order-detail-grid"><section className="customer-panel order-detail-status"><span className="portal-kicker">CURRENT SHIPMENT STATUS</span><OrderStatus status={order.status} /><h2>{order.status}</h2><p>Last known location: <b>{order.lastLocation}</b></p><p>Estimated delivery: <b>{order.eta}</b></p></section><section className="customer-panel order-detail-timeline"><div className="customer-panel-head"><div><span className="portal-kicker">TRACKING HISTORY</span><h2>Shipment updates</h2></div></div>{order.events.map((event) => <div className={`shipment-event${event.complete ? ' event-complete' : ''}`} key={`${event.date}-${event.title}`}><i /><span><b>{event.title}</b><small>{event.location} · {formatDate(event.date, true)}</small><p>{event.description}</p></span></div>)}</section></div></div>
}
