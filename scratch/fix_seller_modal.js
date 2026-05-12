const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('import RescheduleModal')) {
    content = content.replace("import ScheduleCalendar from \"@/components/ScheduleCalendar\"", "import ScheduleCalendar from \"@/components/ScheduleCalendar\"\nimport RescheduleModal from \"@/components/RescheduleModal\"");
}

// 2. Remove old modal
const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('{/* Reschedule Modal */}'));
if (startIndex !== -1) {
    // Find the end of the modal block (it's the end of the file almost)
    let depth = 0;
    let endIndex = -1;
    for (let i = startIndex; i < lines.length; i++) {
        if (lines[i].includes('{')) depth++;
        if (lines[i].includes('}')) depth--;
        if (depth === 0 && i > startIndex + 1) {
            endIndex = i;
            break;
        }
    }

    if (endIndex !== -1) {
        const newModal = `            {/* Reschedule Modal */}
            <RescheduleModal 
                isOpen={isRescheduleModalOpen}
                onClose={() => {
                    setIsRescheduleModalOpen(false);
                    setSelectedOrder(null);
                }}
                orderId={selectedOrder?.id}
                role="SELLER"
                onRescheduled={(updatedOrder) => {
                    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                }}
            />`;
        
        const before = lines.slice(0, startIndex).join('\n');
        const after = lines.slice(endIndex + 1).join('\n');
        content = before + '\n' + newModal + '\n' + after;
    }
}

fs.writeFileSync(path, content);
console.log('Updated app/seller/orders/page.jsx');
