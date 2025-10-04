import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Event listeners para monitorar a conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado');
    });

  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    
    // Em desenvolvimento, usar dados mock se MongoDB não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Usando dados simulados para desenvolvimento');
      return;
    }
    
    process.exit(1);
  }
};

// Configurações do Mongoose
mongoose.set('strictQuery', false);

// Função para desconectar do banco
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Conexão MongoDB fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão MongoDB:', error.message);
  }
};