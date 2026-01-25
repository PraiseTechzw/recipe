import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RECIPES } from '../../data/recipes';

const { width } = Dimensions.get('window');

export default function CookingModeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const recipe = RECIPES.find((r) => r.id === id);

  if (!recipe || !recipe.steps) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Recipe not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Text>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const steps = recipe.steps;
  const currentStep = steps[currentStepIndex];
  const progress = (currentStepIndex + 1) / steps.length;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finished
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>COOKING MODE</Text>
        
        <View style={styles.timerPill}>
          <Ionicons name="timer-outline" size={16} color="#E65100" />
          <Text style={styles.timerText}>15:00</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
            <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>
                    <Text style={styles.stepHighlight}>Step {currentStepIndex + 1}</Text> of {steps.length}
                </Text>
                <Text style={styles.timeText}>~5 mins</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
                {steps.map((_, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.progressSegment, 
                            { 
                                backgroundColor: index <= currentStepIndex ? '#E65100' : '#E0E0E0',
                                flex: 1 
                            }
                        ]} 
                    />
                ))}
            </View>
        </View>

        {/* Media Section */}
        <View style={styles.mediaContainer}>
            <Image 
                source={{ uri: currentStep.image || recipe.image }} 
                style={styles.mediaImage} 
                contentFit="cover"
            />
            {/* Play Button Overlay (Mock) */}
            <View style={styles.playButton}>
                <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 2 }} />
            </View>
        </View>

        {/* Instruction Section */}
        <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
                {currentStep.highlightedWord ? (
                   <>
                     {currentStep.instruction.split(currentStep.highlightedWord)[0]}
                     <Text style={styles.highlightedInstructionWord}>{currentStep.highlightedWord}</Text>
                     {currentStep.instruction.split(currentStep.highlightedWord)[1]}
                   </>
                ) : (
                    currentStep.instruction
                )}
            </Text>
            
            {currentStep.description && (
                <Text style={styles.descriptionText}>
                    {currentStep.description}
                </Text>
            )}
        </View>

        {/* Chef's Tip */}
        {currentStep.tip && (
            <View style={styles.tipContainer}>
                <View style={styles.tipIconCircle}>
                    <MaterialIcons name="lightbulb" size={20} color="#E65100" />
                </View>
                <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Chef's Tip</Text>
                    <Text style={styles.tipText}>{currentStep.tip}</Text>
                </View>
                <View style={styles.tipLeftBorder} />
            </View>
        )}

        {/* Voice Command Indicator */}
        <View style={styles.voiceIndicator}>
            <Ionicons name="mic" size={16} color="#BDBDBD" />
            <Text style={styles.voiceText}>VOICE COMMANDS ACTIVE</Text>
        </View>

      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.navButton, styles.prevButton, currentStepIndex === 0 && styles.disabledButton]} 
            onPress={handlePrev}
            disabled={currentStepIndex === 0}
        >
            <Ionicons name="arrow-back" size={24} color={currentStepIndex === 0 ? "#E0E0E0" : "#E65100"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
                {currentStepIndex === steps.length - 1 ? 'Finish Cooking' : 'Next Step'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.5,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    color: '#E65100',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  progressSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#8D6E63',
    fontWeight: '500',
  },
  stepHighlight: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#8D6E63',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  progressSegment: {
    height: 4,
    borderRadius: 2,
  },
  mediaContainer: {
    width: '100%',
    height: 250,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: '#fff',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)', // Note: backdropFilter might not work on Android/iOS natively without extra config, but visual fallback is fine
  },
  instructionContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  highlightedInstructionWord: {
    color: '#E65100',
    textDecorationLine: 'underline',
  },
  descriptionText: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#E65100',
  },
  tipIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  voiceIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  voiceText: {
    fontSize: 12,
    color: '#BDBDBD',
    letterSpacing: 1,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40, // Extra padding for Safe Area
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  prevButton: {
    // specific styles
  },
  disabledButton: {
    borderColor: '#EEE',
    backgroundColor: '#FAFAFA',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    height: 56,
    backgroundColor: '#E65100',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
