import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';
import { Button } from '../ui/Button'; // Assuming we have this from previous steps

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleRestart = async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Fallback if Updates not available (e.g. dev mode)
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong.</Text>
            <Text style={styles.message}>
              We&apos;re sorry, but the app encountered an unexpected error.
            </Text>
            {this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              </View>
            )}
            <Button 
              title="Restart App" 
              onPress={this.handleRestart} 
              variant="primary"
              style={styles.button}
            />
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // COLORS.light.background
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212121', // COLORS.light.text
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#757575', // COLORS.light.textSecondary
  },
  errorBox: {
    backgroundColor: '#FFEBEE', // Light red
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: '100%',
  },
  errorText: {
    color: '#B00020', // COLORS.light.error
    fontFamily: 'monospace',
    fontSize: 12,
  },
  button: {
    minWidth: 200,
  },
});
