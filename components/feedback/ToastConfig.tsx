import { BaseToast, ErrorToast, ToastProps } from 'react-native-toast-message';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/*
  Custom Toast Configuration
  Supports standard success/error/info plus 'action' type for Undo operations
*/

export const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4CAF50' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold'
      }}
      text2Style={{
        fontSize: 13
      }}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold'
      }}
      text2Style={{
        fontSize: 13
      }}
    />
  ),
  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#2196F3' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold'
      }}
    />
  ),
  // Custom type for actions (e.g. Undo)
  action: ({ text1, text2, props }: ToastProps) => (
    <View style={styles.actionContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.actionTitle}>{text1}</Text>
        {text2 && <Text style={styles.actionMessage}>{text2}</Text>}
      </View>
      {props.action && (
        <TouchableOpacity 
            style={styles.actionButton} 
            onPress={props.action.onPress}
            activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>{props.action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
};

const styles = StyleSheet.create({
  actionContainer: {
    height: 60,
    width: '90%',
    backgroundColor: '#333',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionMessage: {
    color: '#ccc',
    fontSize: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#555',
    borderRadius: 4,
    marginLeft: 12,
  },
  actionButtonText: {
    color: '#FFD700', // Gold color for visibility
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
