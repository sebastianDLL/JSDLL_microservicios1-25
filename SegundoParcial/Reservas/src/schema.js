const { gql } = require('apollo-server');

const typeDefs = gql`
  type Reserva {
    id: ID!
    habitacion_id: Int!
    usuario_id: Int!
    fecha_reserva: String!
    fecha_entrada: String!
    fecha_salida: String!
    estado: String!
    monto_total: Float!
  }

  input ReservaInput {
    habitacion_id: Int!
    usuario_id: Int!
    fecha_entrada: String!
    fecha_salida: String!
    estado: String!
    monto_total: Float!
  }

  type Query {
    reservas: [Reserva]
    reserva(id: ID!): Reserva
    reservasPorUsuario(usuario_id: Int!): [Reserva]
  }

  type Mutation {
    crearReserva(input: ReservaInput!): Reserva
    actualizarReserva(id: ID!, input: ReservaInput!): Reserva
    eliminarReserva(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    reservas: async (_, __, { pool, user }) => {
      if (!user) throw new Error('No autorizado');
      const result = await pool.query('SELECT * FROM reservas');
      return result.rows;
    },
    reserva: async (_, { id }, { pool, user }) => {
      if (!user) throw new Error('No autorizado');
      const result = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
      return result.rows[0];
    },
    reservasPorUsuario: async (_, { usuario_id }, { pool, user }) => {
      if (!user) throw new Error('No autorizado');
      const result = await pool.query('SELECT * FROM reservas WHERE usuario_id = $1', [usuario_id]);
      return result.rows;
    }
  },
  Mutation: {
    crearReserva: async (_, { input }, { pool, user }) => {
      if (!user) throw new Error('No autorizado');
      const { habitacion_id, usuario_id, fecha_entrada, fecha_salida, estado, monto_total } = input;
      const result = await pool.query(
        'INSERT INTO reservas (habitacion_id, usuario_id, fecha_entrada, fecha_salida, estado, monto_total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [habitacion_id, usuario_id, fecha_entrada, fecha_salida, estado, monto_total]
      );
      return result.rows[0];
    },
    actualizarReserva: async (_, { id, input }, { pool, user }) => {
      if (!user) throw new Error('No autorizado');
      const { habitacion_id, usuario_id, fecha_entrada, fecha_salida, estado, monto_total } = input;
      const result = await pool.query(
        'UPDATE reservas SET habitacion_id = $1, usuario_id = $2, fecha_entrada = $3, fecha_salida = $4, estado = $5, monto_total = $6 WHERE id = $7 RETURNING *',
        [habitacion_id, usuario_id, fecha_entrada, fecha_salida, estado, monto_total, id]
      );
      return result.rows[0];
    },
    eliminarReserva: async (_, { id }, { pool, user }) => {
      if (!user) throw new Error('No autorizado');
      await pool.query('DELETE FROM reservas WHERE id = $1', [id]);
      return true;
    }
  }
};

module.exports = { typeDefs, resolvers };