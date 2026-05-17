// Tela de configurações do usuário com temas, notificações e conta
import { useState, useEffect } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Switch, Button, TextInput } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getUserAvatarColor } from '../utils/avatarColor';

// Opções exibidas na lista de configurações de conta
const options = [
  { id: '1', title: 'Perfil', subtitle: 'Editar informações pessoais', icon: '👤' },
  { id: '2', title: 'Notificações', subtitle: 'Gerenciar alertas e atualizações', icon: '🔔' },
  { id: '3', title: 'Reprodução', subtitle: 'Qualidade de áudio e configurações', icon: '🎵' },
  { id: '4', title: 'Armazenamento', subtitle: 'Downloads e gerenciamento de espaço', icon: '💾' },
  { id: '5', title: 'Privacidade', subtitle: 'Configurações de privacidade e dados', icon: '🔒' },
  { id: '6', title: 'Ajuda e Suporte', subtitle: 'Obtenha ajuda e contate o suporte', icon: '❓' },
];

const optionDetails = {
  '1': [
    { id: '1-1', label: 'Informações da conta', description: 'Ver detalhes de email, nome e tipo de conta.' },
    { id: '1-2', label: 'Preferências de perfil', description: 'Gerenciar como seu perfil aparece no app.' },
  ],
  '2': [
    { id: '2-1', label: 'Tipos de notificação', description: 'Escolha alertas para lançamentos, recomendações e mensagens.' },
    { id: '2-2', label: 'Som e vibração', description: 'Ativar som ou vibração para avisos do app.' },
  ],
  '3': [
    { id: '3-1', label: 'Qualidade de áudio', description: 'Selecione entre padrão e alta qualidade de reprodução.' },
    { id: '3-2', label: 'Equalizador', description: 'Configurar graves, médios e agudos.' },
    { id: '3-3', label: 'Pré-carregamento', description: 'Baixar músicas para reprodução offline.' },
  ],
  '4': [
    { id: '4-1', label: 'Gerenciar downloads', description: 'Apagar ou mover arquivos offline.' },
    { id: '4-2', label: 'Uso de armazenamento', description: 'Ver quanto espaço o app ocupa.' },
  ],
  '5': [
    { id: '5-1', label: 'Segurança', description: 'Alterar senha e método de login.' },
    { id: '5-2', label: 'Permissões', description: 'Gerenciar acesso a dados e senhas.' },
    { id: '5-3', label: 'Dados de uso', description: 'Ver histórico e backups.' },
  ],
  '6': [
    { id: '6-1', label: 'FAQ', description: 'Perguntas frequentes e dicas.' },
    { id: '6-2', label: 'Fale conosco', description: 'Suporte por email ou chat.' },
  ],
};

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleTheme, user, logout, changePassword, changeUserName, deleteAccount } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [expandedOption, setExpandedOption] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [nameStatus, setNameStatus] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);
  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const avatarColor = getUserAvatarColor(user?.email || user?.name || 'default');

  // Processa a alteração de senha do usuário com validação de campos
  // Verifica se a nova senha e confirmação são idênticas antes de atualizar
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ success: false, message: 'Preencha todos os campos.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: 'As senhas não coincidem.' });
      return;
    }
    const result = await changePassword(currentPassword, newPassword);
    setPasswordStatus(result);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  useEffect(() => {
    setEditedName(user?.name || '');
  }, [user?.name]);

  // Exibe confirmação antes de deletar a conta do usuário permanentemente
  // Requer confirmação do usuário para evitar exclusão acidental
  const handleDeleteAccount = () => {
    Alert.alert(
      'Deletar conta',
      'Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir conta',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount();
            if (!result.success) {
              Alert.alert('Erro', result.message);
            }
          },
        },
      ]
    );
  };

  // Salva o novo nome do usuário após validação
  // Garante que o nome não está vazio e atualiza o estado de edição
  const handleNameSave = async () => {
    if (!editedName.trim()) {
      setNameStatus({ success: false, message: 'Digite um nome válido.' });
      return;
    }

    const result = await changeUserName(editedName.trim());
    setNameStatus(result);
    if (result.success) {
      setIsEditingName(false);
    }
  };

  // Estilos específicos para a tela de configurações
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 20,
      paddingTop: 40,
      paddingBottom: 100,
    },
    profileCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    profileAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: theme.white,
      fontSize: 24,
      fontWeight: '700',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      color: theme.white,
      fontSize: 18,
      fontWeight: '700',
    },
    profileEmail: {
      color: theme.gray300,
      fontSize: 14,
      marginTop: 2,
    },
    editButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    editText: {
      color: theme.white,
      fontSize: 14,
      fontWeight: '600',
    },
    deleteAccountButton: {
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#B00020',
      backgroundColor: 'transparent',
    },
    deleteAccountText: {
      color: '#B00020',
      fontSize: 15,
      fontWeight: '700',
    },
    editNameContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    profileInput: {
      backgroundColor: theme.inputBackground,
      color: theme.white,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      marginBottom: 12,
    },
    saveNameButton: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveNameText: {
      color: theme.white,
      fontSize: 15,
      fontWeight: '700',
    },
    nameStatus: {
      marginTop: 12,
      fontSize: 13,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: theme.white,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
    },
    settingRow: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '600',
    },
    settingSubtitle: {
      color: theme.gray300,
      fontSize: 14,
      marginTop: 2,
    },
    optionCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionIcon: {
      fontSize: 20,
      marginRight: 16,
    },
    optionInfo: {
      flex: 1,
    },
    optionTitle: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '600',
    },
    optionSubtitle: {
      color: theme.gray300,
      fontSize: 14,
      marginTop: 2,
    },
    expandIcon: {
      color: theme.gray300,
      fontSize: 22,
      fontWeight: '700',
    },
    detailPanel: {
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.gray400Light,
      padding: 12,
      marginBottom: 12,
      marginHorizontal: 4,
    },
    detailItem: {
      marginBottom: 12,
      padding: 10,
      borderRadius: 10,
    },
    detailItemActive: {
      backgroundColor: theme.primarySoft,
    },
    detailLabel: {
      color: theme.white,
      fontSize: 15,
      fontWeight: '700',
    },
    detailDescription: {
      color: theme.gray300,
      fontSize: 13,
      marginTop: 4,
    },
    formGroup: {
      marginTop: 16,
    },
    textInput: {
      backgroundColor: theme.inputBackground,
      color: theme.white,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 10,
      fontSize: 14,
    },
    passwordButton: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    passwordButtonText: {
      color: theme.white,
      fontSize: 15,
      fontWeight: '700',
    },
    passwordStatus: {
      marginTop: 12,
      fontSize: 13,
    },
    logoutContainer: {
      marginTop: 10,
      marginBottom: 10,
    }
  });

  // Layout principal da tela de configurações com perfil e preferências
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={[styles.profileAvatar, { backgroundColor: avatarColor }]}> 
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Usuário Musium'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'usuario@musium.com'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setIsEditingName(!isEditingName);
              setEditedName(user?.name || '');
              setNameStatus(null);
            }}
          >
            <Text style={styles.editText}>{isEditingName ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
        {isEditingName && (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.profileInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Novo nome de usuário"
              placeholderTextColor={theme.gray400}
            />
            <TouchableOpacity style={styles.saveNameButton} onPress={handleNameSave}>
              <Text style={styles.saveNameText}>Salvar nome</Text>
            </TouchableOpacity>
            {nameStatus && (
              <Text style={[styles.nameStatus, { color: nameStatus.success ? '#4ade80' : '#f87171' }]}>
                {nameStatus.message}
              </Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Modo escuro</Text>
              <Text style={styles.settingSubtitle}>Alternar tema escuro</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.gray400, true: theme.primary }}
              thumbColor={isDarkMode ? theme.white : theme.gray300}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notificações</Text>
              <Text style={styles.settingSubtitle}>Receber notificações push</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.gray400, true: theme.primary }}
              thumbColor={notifications ? theme.white : theme.gray300}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          {options.map((option) => {
            const isExpanded = expandedOption === option.id;
            const details = optionDetails[option.id] || [];

            return (
              <View key={option.id}>
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => {
                    const nextExpanded = isExpanded ? null : option.id;
                    setExpandedOption(nextExpanded);
                    if (!nextExpanded) {
                      setSelectedDetailId(null);
                    }
                  }}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '⌄' : '›'}</Text>
                </TouchableOpacity>

                {isExpanded && details.length > 0 && (
                  <View style={styles.detailPanel}>
                    {details.map((item) => {
                      const isActive = selectedDetailId === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.detailItem, isActive && styles.detailItemActive]}
                          onPress={() => setSelectedDetailId(isActive ? null : item.id)}
                        >
                          <Text style={styles.detailLabel}>{item.label}</Text>
                          <Text style={styles.detailDescription}>{item.description}</Text>
                        </TouchableOpacity>
                      );
                    })}

                    {option.id === '1' && (
                      <TouchableOpacity
                        style={styles.deleteAccountButton}
                        onPress={handleDeleteAccount}
                      >
                        <Text style={styles.deleteAccountText}>Excluir conta</Text>
                      </TouchableOpacity>
                    )}

                    {option.id === '5' && selectedDetailId === '5-1' && (
                      <View style={styles.formGroup}>
                        <Text style={styles.detailLabel}>Trocar senha</Text>
                        <TextInput
                          style={styles.textInput}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          placeholder="Senha atual"
                          placeholderTextColor={theme.gray400}
                          secureTextEntry
                        />
                        <TextInput
                          style={styles.textInput}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Nova senha"
                          placeholderTextColor={theme.gray400}
                          secureTextEntry
                        />
                        <TextInput
                          style={styles.textInput}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Confirmar nova senha"
                          placeholderTextColor={theme.gray400}
                          secureTextEntry
                        />
                        <TouchableOpacity style={styles.passwordButton} onPress={handlePasswordChange}>
                          <Text style={styles.passwordButtonText}>Atualizar senha</Text>
                        </TouchableOpacity>
                        {passwordStatus && (
                          <Text
                            style={[
                              styles.passwordStatus,
                              { color: passwordStatus.success ? '#4ade80' : '#f87171' },
                            ]}
                          >
                            {passwordStatus.message}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

            <View style={styles.logoutContainer}>
          <Button 
            title="Sair da Conta" 
            color="#D32F2F" 
            onPress={logout} 
          />
        </View>
      </ScrollView>
    </View>
  );
}
