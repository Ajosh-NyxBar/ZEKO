import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "./BackButton";

const { width, height } = Dimensions.get("window");

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: () => void;
  onBack?: () => void;
}

export const RegisterScreen = ({ onNavigateToLogin, onRegisterSuccess, onBack }: RegisterScreenProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const handleSubmit = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUpWithEmail(email, password);
      
      if (result.success) {
        Alert.alert(
          "Success", 
          "Registration successful! Welcome to ZEKO!",
          [
            {
              text: "OK",
              onPress: () => {
                if (onRegisterSuccess) {
                  onRegisterSuccess();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert("Registration Failed", result.error || "An error occurred during registration");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        Alert.alert(
          "Success", 
          "Google sign-up successful! Welcome to ZEKO!",
          [
            {
              text: "OK",
              onPress: () => {
                if (onRegisterSuccess) {
                  onRegisterSuccess();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert("Google Sign-Up Failed", result.error || "An error occurred during Google sign-up");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Google sign-up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    // Handle navigation to login screen
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      console.log("Login clicked");
      Alert.alert("Login", "Navigate to login screen");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {onBack && <BackButton onPress={onBack} color="#0377DD" />}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.mainContainer}>
          {/* Header Section with Background Image */}
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/atas3.png")}
              style={styles.headerBackgroundImage}
              contentFit="cover"
            />
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Register Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.registerTitle}>Register</Text>
              <Text style={styles.subtitle}>
                Silahkan Register untuk Login
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#0377DD"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
              />
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#0377DD"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#0377DD"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#0377DD"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="confirm password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.signUpButtonText}>Registering...</Text>
                </View>
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Google Sign Up Button */}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Sign In sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    height: height * 0.35,
    width: "100%",
    position: "relative",
  },
  headerBackgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    minHeight: height * 0.65,
    paddingBottom: 30,
  },
  titleContainer: {
    marginBottom: 25,
    alignItems: "flex-start",
  },
  registerTitle: {
    fontSize: Math.min(28, width * 0.07),
    fontWeight: "bold",
    color: "#0377DD",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: Math.min(14, width * 0.035),
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: height > 700 ? 12 : 8,
    marginBottom: height > 700 ? 15 : 10,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(15, width * 0.04),
    color: "#333",
    padding: 0,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    padding: 5,
  },
  signUpButton: {
    backgroundColor: "#0377DD",
    borderRadius: 25,
    paddingVertical: height > 700 ? 16 : 12,
    alignItems: "center",
    marginBottom: height > 700 ? 20 : 15,
    marginTop: height > 700 ? 20 : 15,
    shadowColor: "#0377DD",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  signUpButtonText: {
    fontSize: Math.min(16, width * 0.04),
    color: "#FFFFFF",
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: height > 700 ? 16 : 12,
    alignItems: "center",
    marginBottom: height > 700 ? 20 : 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: Math.min(16, width * 0.04),
    color: "#0377DD",
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: height > 700 ? 20 : 15,
  },
  loginText: {
    fontSize: Math.min(14, width * 0.035),
    color: "#666",
  },
  loginLink: {
    fontSize: Math.min(14, width * 0.035),
    color: "#0377DD",
    fontWeight: "600",
  },
});
