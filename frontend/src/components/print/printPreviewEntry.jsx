import ReactDOM from 'react-dom/client';
import InvoicePrintPreview from '../../pages/features/logistic/invoice/components/invoice_print_preview/InvoicePrintPreview';

const root = ReactDOM.createRoot(document.getElementById('print-root'));
root.render(
    <InvoicePrintPreview
        invoiceOrder={window.invoiceOrder}
        calculatedTotals={window.calculatedTotals}
        onClose={() => window.close()}
    />
);
