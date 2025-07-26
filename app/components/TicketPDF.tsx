import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  center: {
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  business: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    color: '#444',
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    marginVertical: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 6,
  },
  total: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 6,
    fontSize: 11,
  },
  footer: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 9,
    color: '#777',
  },
  divider: {
    marginVertical: 4,
    textAlign: 'center',
    fontSize: 10,
    color: '#ccc',
  },
});

function formatPesos(value: number): string {
  return `$${value
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export default function TicketPDF({ transaccion }: { transaccion: any }) {
  const fecha = new Date(transaccion.fecha).toLocaleString('es-AR');

  const totalPesos =
    transaccion.ventas?.reduce(
      (sum: number, v: any) => sum + (v.precio_unitario ?? 0) * v.cantidad,
      0
    ) ?? 0;

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.business}>Negocio Monte</Text>
          <Text style={styles.title}>Ticket de Venta</Text>
          <Text style={styles.label}>Fecha: {fecha}</Text>
          <Text style={styles.label}>Transacción N° {transaccion.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Cliente:</Text>
          <Text>{transaccion.cliente?.nombre ?? 'No registrado'}</Text>
        </View>

        <Text style={styles.divider}>------------------------------</Text>

        <View>
          <Text style={styles.bold}>Detalle de productos:</Text>
          {transaccion.ventas?.map((venta: any, i: number) => {
            const nombre = venta.variante?.producto?.nombre ?? 'Producto';
            const color = venta.variante?.color ?? '-';
            const talla = venta.variante?.talla ?? '-';
            const cantidad = venta.cantidad ?? 1;
            const precioUnit = venta.precio_unitario ?? 0;
            const subtotal = cantidad * precioUnit;

            return (
              <View key={i} style={styles.line}>
                <Text>{nombre} ({color}/{talla}) x{cantidad}</Text>
                <Text>
                  {formatPesos(precioUnit)} = {formatPesos(subtotal)}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.divider}>------------------------------</Text>

        <View style={styles.total}>
          <View style={styles.line}>
            <Text style={styles.bold}>Total unidades:</Text>
            <Text>{transaccion.total}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.bold}>TOTAL A PAGAR:</Text>
            <Text style={styles.bold}>{formatPesos(totalPesos)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>¡Gracias por tu compra!</Text>
        <Text style={styles.footer}>contacto@tu-negocio.com</Text>
        <Text style={styles.footer}>CUIT 30-99999999-9</Text>
      </Page>
    </Document>
  );
}
