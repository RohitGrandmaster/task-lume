/**
 * RESPONSIBILITY: Enterprise Mobile Error Boundary for TaskLume (Rule 44, Rule 56).
 * FLOW: Catches unhandled JavaScript component errors; displays a Luxury Gold branded crash screen with a retry action.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary] Caught crash in render tree:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.emoji}>⚠️</Text>
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred. You can tap the button below to recover or restart the app.
            </Text>
            {__DEV__ && this.state.error ? (
              <Text style={styles.errorText} numberOfLines={5}>
                {String(this.state.error?.message || this.state.error)}
              </Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Try again and recover"
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // Luxury Gold dark background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#111111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(250,204,21,0.15)',
    borderWidth: 1.5,
    borderColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 11,
    color: '#FCA5A5',
    backgroundColor: '#450A0A',
    padding: 10,
    borderRadius: 8,
    textAlign: 'left',
    marginBottom: 16,
    width: '100%',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#EAB308',
  },
  buttonText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ErrorBoundary;
