import { useAICaptureStore } from '../../stores/aiCaptureStore';
import { aiRecipeService } from '../../services/aiRecipes';
import { ImageCaptureService } from '../../services/imageCapture';
import { useStore } from '../../store/useStore';

// Mock dependencies
jest.mock('../../services/aiRecipes');
jest.mock('../../services/imageCapture');
jest.mock('../../store/useStore', () => ({
  useStore: {
    getState: jest.fn(),
  },
}));

describe('useAICaptureStore', () => {
  beforeEach(() => {
    // Reset store state
    useAICaptureStore.setState({
      status: 'idle',
      imageUri: null,
      imageBase64: null,
      extractedIngredients: [],
      editedIngredients: [],
      generatedRecipe: null,
      error: null,
    });
    jest.clearAllMocks();
  });

  it('should start in idle state', () => {
    expect(useAICaptureStore.getState().status).toBe('idle');
  });

  describe('startCamera', () => {
    it('should transition to capturing state', () => {
      useAICaptureStore.getState().startCamera();
      expect(useAICaptureStore.getState().status).toBe('capturing');
    });
  });

  describe('pickFromGallery', () => {
    it('should set image and transition to reviewingImage on success', async () => {
      const mockImage = { uri: 'file://test.jpg', base64: 'base64data' };
      (ImageCaptureService.pickFromGallery as jest.Mock).mockResolvedValue(mockImage);

      await useAICaptureStore.getState().pickFromGallery();

      expect(useAICaptureStore.getState().status).toBe('reviewingImage');
      expect(useAICaptureStore.getState().imageUri).toBe(mockImage.uri);
      expect(useAICaptureStore.getState().imageBase64).toBe(mockImage.base64);
    });

    it('should stay idle if user cancels', async () => {
      (ImageCaptureService.pickFromGallery as jest.Mock).mockResolvedValue(null);

      await useAICaptureStore.getState().pickFromGallery();

      expect(useAICaptureStore.getState().status).toBe('idle');
    });

    it('should set error state on failure', async () => {
      (ImageCaptureService.pickFromGallery as jest.Mock).mockRejectedValue(new Error('Failed'));

      await useAICaptureStore.getState().pickFromGallery();

      expect(useAICaptureStore.getState().status).toBe('error');
      expect(useAICaptureStore.getState().error?.type).toBe('camera');
    });
  });

  describe('extractIngredients', () => {
    it('should set ingredients on success', async () => {
      const mockResult = {
        ingredients: [{ name: 'tomato' }, { name: 'onion' }],
        notes: 'Fresh',
        warnings: [],
      };
      (aiRecipeService.extractIngredients as jest.Mock).mockResolvedValue(mockResult);

      await useAICaptureStore.getState().extractIngredients('base64data');

      expect(useAICaptureStore.getState().status).toBe('editingIngredients');
      expect(useAICaptureStore.getState().extractedIngredients).toEqual(['tomato', 'onion']);
      expect(useAICaptureStore.getState().editedIngredients).toEqual(['tomato', 'onion']);
    });

    it('should set error on failure', async () => {
      (aiRecipeService.extractIngredients as jest.Mock).mockRejectedValue(new Error('AI Error'));

      await useAICaptureStore.getState().extractIngredients('base64data');

      expect(useAICaptureStore.getState().status).toBe('error');
      expect(useAICaptureStore.getState().error?.type).toBe('ai');
    });
  });

  describe('generateRecipe', () => {
    it('should fail if no ingredients', async () => {
      useAICaptureStore.setState({ editedIngredients: [] });
      await useAICaptureStore.getState().generateRecipe();
      expect(useAICaptureStore.getState().status).toBe('error');
      expect(useAICaptureStore.getState().error?.type).toBe('validation');
    });

    it('should generate recipe using pantry items', async () => {
      // Setup state
      useAICaptureStore.setState({ editedIngredients: ['tomato'] });
      
      // Mock pantry
      (useStore.getState as jest.Mock).mockReturnValue({ pantry: ['salt'] });
      
      // Mock service
      const mockRecipe = { title: 'Tomato Soup', steps: [] };
      (aiRecipeService.generateRecipe as jest.Mock).mockResolvedValue(mockRecipe);

      await useAICaptureStore.getState().generateRecipe();

      expect(useAICaptureStore.getState().status).toBe('showingResults');
      expect(useAICaptureStore.getState().generatedRecipe).toEqual(mockRecipe);
      
      // Verify service called with pantry items
      expect(aiRecipeService.generateRecipe).toHaveBeenCalledWith(
        ['tomato'],
        ['salt'],
        undefined
      );
    });
  });
});
