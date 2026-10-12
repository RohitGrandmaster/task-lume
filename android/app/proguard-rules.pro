# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native & Hermes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <fields>;
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <fields>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native Gesture Handler & Screens
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }

# Notifee
-keep class io.invertase.notifee.** { *; }

# Voice & Audio
-keep class com.wenkesj.voice.** { *; }
-keep class com.zmxv.RNSound.** { *; }

# Keychain
-keep class com.oblador.keychain.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Nitro Modules
-keep class com.margelo.nitro.** { *; }

