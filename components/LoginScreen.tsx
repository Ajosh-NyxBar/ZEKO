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

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: () => void;
  onBack?: () => void;
}

export const LoginScreen = ({ onNavigateToRegister, onLoginSuccess, onBack }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signInWithEmail, signInWithGoogle, loading, error } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    const result = await signInWithEmail(email, password);
    
    if (result.success) {
      Alert.alert("Success", "Login successful!");
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      Alert.alert("Login Failed", result.error || "Please check your credentials and try again.");
    }
  };

  const handleGoogleLogin = async () => {
    // Show info for Expo Go users
    if (Platform.OS !== 'web') {
      Alert.alert(
        "Google Sign-In Info", 
        "Google Sign-In works best with a development build. In Expo Go, it may have limitations. Try using email/password for testing.",
        [
          { text: "Use Email/Password", style: "cancel" },
          { text: "Try Google Sign-In", onPress: () => performGoogleSignIn() }
        ]
      );
    } else {
      performGoogleSignIn();
    }
  };

  const performGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    
    if (result.success) {
      Alert.alert("Success", "Google login successful!");
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      Alert.alert("Google Login Failed", result.error || "Please try again.");
    }
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log("Forgot password clicked");
    Alert.alert("Forgot Password", "Password recovery feature coming soon");
  };

  const handleRegister = () => {
    // Handle register navigation here
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else {
      console.log("Register clicked");
      Alert.alert("Register", "Registration feature coming soon");
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
              source={require("@/assets/images/atas2.png")}
              style={styles.headerBackgroundImage}
              contentFit="cover"
            />
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Login Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.loginTitle}>Login</Text>
              <Text style={styles.subtitle}>
                Silahkan Sign untuk melanjutkan
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

            {/* Remember Me and Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forget Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={[styles.googleButton, loading && { opacity: 0.6 }]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <Ionicons name="logo-google" size={24} color="#4285F4" />
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Register sekarang</Text>
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
    height: height * 0.35, // Reduced height for better proportion
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
    minHeight: height * 0.65, // Ensures it fills remaining space
    paddingBottom: 30, // Add bottom padding for better spacing
  },
  titleContainer: {
    marginBottom: 25,
    alignItems: "flex-start",
  },
  loginTitle: {
    fontSize: Math.min(28, width * 0.07), // Responsive font size
    fontWeight: "bold",
    color: "#0377DD",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: Math.min(14, width * 0.035), // Responsive font size
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: height > 700 ? 12 : 8, // Adaptive padding
    marginBottom: height > 700 ? 15 : 10, // Adaptive margin
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(15, width * 0.04), // Responsive font size
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height > 700 ? 20 : 15, // Adaptive margin
    marginTop: 5,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#DDD",
    borderRadius: 3,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#0377DD",
    borderColor: "#0377DD",
  },
  rememberMeText: {
    fontSize: Math.min(14, width * 0.035),
    color: "#666",
  },
  forgotPasswordText: {
    fontSize: Math.min(14, width * 0.035),
    color: "#0377DD",
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: "#0377DD",
    borderRadius: 25,
    paddingVertical: height > 700 ? 16 : 12, // Adaptive padding
    alignItems: "center",
    marginBottom: height > 700 ? 20 : 15, // Adaptive margin
    shadowColor: "#0377DD",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  signInButtonText: {
    fontSize: Math.min(16, width * 0.04),
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height > 700 ? 20 : 15, // Adaptive margin
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: Math.min(12, width * 0.03),
    color: "#999",
    marginHorizontal: 15,
  },
  googleButton: {
    width: height > 700 ? 50 : 45, // Adaptive size
    height: height > 700 ? 50 : 45,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: height > 700 ? 25 : 22.5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: height > 700 ? 20 : 15, // Adaptive margin
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10, // Reduced margin
  },
  registerText: {
    fontSize: Math.min(14, width * 0.035),
    color: "#666",
  },
  registerLink: {
    fontSize: Math.min(14, width * 0.035),
    color: "#0377DD",
    fontWeight: "600",
  },
});
