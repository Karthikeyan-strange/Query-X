export type CustomerTicketStatus = 'RECEIVED' | 'PROCESSING' | 'INVESTIGATING' | 'AWAITING_CUSTOMER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'
export type CustomerComplaintCategory = 'Delayed Delivery' | 'Shipment Not Updated' | 'Package Not Delivered' | 'Damaged Package' | 'Incorrect Delivery Status' | 'Other'
export type ConversationRole = 'Customer' | 'Support Agent' | 'AI Assistant'

export interface CustomerOrderEvent {
  date: string
  title: string
  description: string
  location: string
  complete: boolean
}

export interface CustomerOrder {
  id: string
  trackingNumber: string
  courier: string
  status: string
  eta: string
  lastLocation: string
  shippedAt: string
  events: CustomerOrderEvent[]
}

export interface TicketAttachment { name: string; size: number }
export interface TicketMessage {
  id: string
  sender: string
  role: ConversationRole
  sentAt: string
  body: string
  attachments?: TicketAttachment[]
  unread?: boolean
}

export interface CustomerTicket {
  id: string
  orderId: string
  subject: string
  category: CustomerComplaintCategory
  submittedAt: string
  lastResponseAt: string
  status: CustomerTicketStatus
  preview: string
  messages: TicketMessage[]
}

export interface CustomerAccount {
  name: string
  email: string
  orders: CustomerOrder[]
  tickets: CustomerTicket[]
}

const sampleEvents = (destination: string): CustomerOrderEvent[] => [
  { date: '2026-11-03T08:25:00+05:30', title: 'Order confirmed', description: 'Your order is being prepared for dispatch.', location: destination, complete: true },
  { date: '2026-11-03T17:40:00+05:30', title: 'Picked up by courier', description: 'The shipment has left the origin facility.', location: 'Chennai North Hub', complete: true },
  { date: '2026-11-04T06:15:00+05:30', title: 'Arrived at transit hub', description: 'Shipment scanned at the regional sorting facility.', location: 'Chennai North Hub', complete: true },
  { date: '2026-11-05T09:12:00+05:30', title: 'Delivery exception reported', description: 'A local route disruption may affect the next scan.', location: 'Chennai, Tamil Nadu', complete: false },
]

export const customerAccounts: CustomerAccount[] = [
  {
    name: 'Arun Kumar', email: 'arun.kumar@example.in',
    orders: [
      { id: 'TN-78420319', trackingNumber: 'LGC-TN-90218471', courier: 'Logistics Core Express', status: 'Delayed · In transit', eta: 'Updated estimate pending', lastLocation: 'Chennai North Hub, Madhavaram', shippedAt: '3 Nov 2026', events: sampleEvents('Adyar, Chennai') },
      { id: 'TN-78415702', trackingNumber: 'LGC-TN-90217220', courier: 'Logistics Core Express', status: 'Delivered', eta: 'Delivered 31 Oct 2026', lastLocation: 'Adyar, Chennai', shippedAt: '28 Oct 2026', events: [
        { date: '2026-10-28T10:10:00+05:30', title: 'Order confirmed', description: 'Order prepared for dispatch.', location: 'Chennai', complete: true },
        { date: '2026-10-29T15:20:00+05:30', title: 'In transit', description: 'Shipment arrived in the destination city.', location: 'Chennai South Hub', complete: true },
        { date: '2026-10-31T12:06:00+05:30', title: 'Delivered', description: 'Package handed to the recipient.', location: 'Adyar, Chennai', complete: true },
      ] },
      { id: 'TN-78396014', trackingNumber: 'LGC-TN-90193882', courier: 'Logistics Core Express', status: 'Out for delivery', eta: 'Today, before 8:00 PM', lastLocation: 'Velachery Delivery Centre', shippedAt: '4 Nov 2026', events: [
        { date: '2026-11-04T11:00:00+05:30', title: 'Order confirmed', description: 'Order prepared for dispatch.', location: 'Chennai', complete: true },
        { date: '2026-11-04T20:15:00+05:30', title: 'In transit', description: 'Shipment reached the destination city.', location: 'Chennai South Hub', complete: true },
        { date: '2026-11-05T08:30:00+05:30', title: 'Out for delivery', description: 'Courier is on the way to your address.', location: 'Velachery Delivery Centre', complete: true },
      ] },
    ],
    tickets: [
      {
        id: 'TKT-2026-0108', orderId: 'TN-78420319', subject: 'Delivery delayed for my order', category: 'Delayed Delivery', submittedAt: '2026-11-04T14:18:00+05:30', lastResponseAt: '2026-11-05T10:26:00+05:30', status: 'AWAITING_CUSTOMER', preview: 'We have confirmed a local route disruption near your delivery area. Could you confirm if the alternate delivery window works for you?',
        messages: [
          { id: 'm-108-1', sender: 'Arun Kumar', role: 'Customer', sentAt: '2026-11-04T14:18:00+05:30', body: 'Hello, my order has not had a tracking update since yesterday. The delivery date has passed. Could you please check what is happening?', attachments: [{ name: 'tracking-screenshot.png', size: 184320 }] },
          { id: 'm-108-2', sender: 'Logistics Core Assistant', role: 'AI Assistant', sentAt: '2026-11-04T14:21:00+05:30', body: 'Thanks for contacting us, Arun. Your request is received and linked to order TN-78420319. We are checking the latest shipment scans and local delivery conditions.' },
          { id: 'm-108-3', sender: 'Priya Srinivasan', role: 'Support Agent', sentAt: '2026-11-05T10:26:00+05:30', body: 'Hi Arun, we have confirmed a local route disruption near your delivery area. Your shipment is still in transit at the Chennai North Hub. Could you confirm if delivery tomorrow works for you? We will keep you updated here.', unread: true },
        ],
      },
      {
        id: 'TKT-2026-0102', orderId: 'TN-78396014', subject: 'Tracking has not updated since dispatch', category: 'Shipment Not Updated', submittedAt: '2026-11-04T18:32:00+05:30', lastResponseAt: '2026-11-04T18:35:00+05:30', status: 'INVESTIGATING', preview: 'Your report is linked to order TN-78396014. We are checking the latest shipment scans.',
        messages: [
          { id: 'm-102-1', sender: 'Arun Kumar', role: 'Customer', sentAt: '2026-11-04T18:32:00+05:30', body: 'My tracking page has not changed since the parcel left Chennai. Can you check if it is still moving?' },
          { id: 'm-102-2', sender: 'Logistics Core Assistant', role: 'AI Assistant', sentAt: '2026-11-04T18:35:00+05:30', body: 'Your report is linked to order TN-78396014. We are checking the latest shipment scans and will share a customer-safe update in this ticket.' },
        ],
      },
      {
        id: 'TKT-2026-0092', orderId: 'TN-78415702', subject: 'Package marked delivered but not received', category: 'Incorrect Delivery Status', submittedAt: '2026-10-30T09:42:00+05:30', lastResponseAt: '2026-10-31T12:21:00+05:30', status: 'RESOLVED', preview: 'Thank you for confirming receipt. We are glad this has been sorted out.',
        messages: [
          { id: 'm-092-1', sender: 'Arun Kumar', role: 'Customer', sentAt: '2026-10-30T09:42:00+05:30', body: 'The tracking page says delivered, but I have not received my parcel. Please check with the courier.' },
          { id: 'm-092-2', sender: 'Priya Srinivasan', role: 'Support Agent', sentAt: '2026-10-30T15:30:00+05:30', body: 'We are checking the delivery scan with the local courier team. Your ticket is linked to order TN-78415702.' },
          { id: 'm-092-3', sender: 'Arun Kumar', role: 'Customer', sentAt: '2026-10-31T11:54:00+05:30', body: 'I found the package with the reception desk. Thank you.' },
          { id: 'm-092-4', sender: 'Priya Srinivasan', role: 'Support Agent', sentAt: '2026-10-31T12:21:00+05:30', body: 'Thank you for confirming receipt. We are glad this has been sorted out. We have marked this ticket resolved.' },
        ],
      },
      {
        id: 'TKT-2026-0076', orderId: 'TN-78396014', subject: 'Request for delivery instructions', category: 'Other', submittedAt: '2026-10-27T16:05:00+05:30', lastResponseAt: '2026-10-28T10:30:00+05:30', status: 'CLOSED', preview: 'Your delivery note has been added to the shipment instructions.',
        messages: [
          { id: 'm-076-1', sender: 'Arun Kumar', role: 'Customer', sentAt: '2026-10-27T16:05:00+05:30', body: 'Please ask the courier to call when they arrive. The gate is usually closed during the afternoon.' },
          { id: 'm-076-2', sender: 'Logistics Core Assistant', role: 'AI Assistant', sentAt: '2026-10-27T16:08:00+05:30', body: 'We have added your delivery instructions to the ticket for the local delivery team.' },
          { id: 'm-076-3', sender: 'Priya Srinivasan', role: 'Support Agent', sentAt: '2026-10-28T10:30:00+05:30', body: 'Your delivery note has been added to the shipment instructions.' },
        ],
      },
    ],
  },
]

