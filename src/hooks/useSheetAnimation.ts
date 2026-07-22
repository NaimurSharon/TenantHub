/**
 * Reusable hook for bottom sheet modal animations.
 * Animates dark backdrop opacity and sheet translate position independently.
 */
import { useRef, useEffect, useState, useCallback } from "react";
import { Animated, Easing, useWindowDimensions } from "react-native";

export function useSheetAnimation(visible: boolean, onClose?: () => void) {
  const { height: screenHeight } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(visible);

  const backdrop = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(card, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(card, {
          toValue: screenHeight,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setModalVisible(false);
        }
      });
    }
  }, [visible, screenHeight, backdrop, card]);

  const close = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(card, {
        toValue: screenHeight,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setModalVisible(false);
        if (callback) callback();
        else if (onClose) onClose();
      }
    });
  }, [backdrop, card, screenHeight, onClose]);

  return {
    modalVisible,
    backdrop,
    card,
    close,
  };
}
