/*
 * Copyright (c) 2010-2014 OTClient <https://github.com/edubart/otclient>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
#ifdef ANDROID

#include "androidmanager.h"
#include <framework/global.h>
#include <framework/core/unzipper.h>
#include <framework/core/resourcemanager.h>
#include <framework/sound/soundmanager.h>

AndroidManager g_androidManager;

AndroidManager::~AndroidManager() {
    if (m_app && m_app->activity && m_app->activity->vm && m_androidManagerJObject) {
        JNIEnv* env = nullptr;
        if (m_app->activity->vm->AttachCurrentThread(&env, nullptr) == 0 && env) {
            env->DeleteGlobalRef(m_androidManagerJObject);
            m_androidManagerJObject = nullptr;
        }
    }
}

void AndroidManager::setAndroidApp(android_app* app) {
    m_app = app;
}

void AndroidManager::setAndroidManager(JNIEnv* env, jobject androidManager) {
    JNIEnv* jniEnv = getJNIEnv();
    jclass androidManagerJClass = jniEnv->GetObjectClass(androidManager);
    m_androidManagerJObject = jniEnv->NewGlobalRef(androidManager);
    m_midShowSoftKeyboard = jniEnv->GetMethodID(androidManagerJClass, "showSoftKeyboard", "()V");
    m_midHideSoftKeyboard = jniEnv->GetMethodID(androidManagerJClass, "hideSoftKeyboard", "()V");
    m_midGetDisplayDensity = jniEnv->GetMethodID(androidManagerJClass, "getDisplayDensity", "()F");
    m_midShowInputPreview = jniEnv->GetMethodID(androidManagerJClass, "showInputPreview", "(Ljava/lang/String;IIII)V");
    m_midUpdateInputPreview = jniEnv->GetMethodID(androidManagerJClass, "updateInputPreview", "(Ljava/lang/String;)V");
    m_midHideInputPreview = jniEnv->GetMethodID(androidManagerJClass, "hideInputPreview", "()V");
    m_midGetClipboardText = jniEnv->GetMethodID(androidManagerJClass, "getClipboardText", "()Ljava/lang/String;");
    m_midSetClipboardText = jniEnv->GetMethodID(androidManagerJClass, "setClipboardText", "(Ljava/lang/String;)V");
    m_midSetScreenOrientation = jniEnv->GetMethodID(androidManagerJClass, "setScreenOrientation", "(Z)V");
    m_midGetLaunchIntentExtra = jniEnv->GetMethodID(androidManagerJClass, "getLaunchIntentExtra", "(Ljava/lang/String;)Ljava/lang/String;");
    jniEnv->DeleteLocalRef(androidManagerJClass);
}

void AndroidManager::setScreenOrientation(bool portrait) {
    JNIEnv* env = getJNIEnv();
    env->CallVoidMethod(m_androidManagerJObject, m_midSetScreenOrientation, (jboolean)portrait);
}

void AndroidManager::showKeyboardSoft() {
    JNIEnv* env = getJNIEnv();
    env->CallVoidMethod(m_androidManagerJObject, m_midShowSoftKeyboard);
}

void AndroidManager::hideKeyboard() {
    JNIEnv* env = getJNIEnv();
    env->CallVoidMethod(m_androidManagerJObject, m_midHideSoftKeyboard);
}

namespace {
    jstring latin1ToJString(JNIEnv* env, const std::string& text) {
        std::u16string utf16;
        utf16.reserve(text.size());
        for (unsigned char c : text) {
            utf16.push_back(static_cast<char16_t>(c));
        }
        return env->NewString(reinterpret_cast<const jchar*>(utf16.data()), static_cast<jsize>(utf16.size()));
    }
}

std::string AndroidManager::getLaunchIntentExtra(const std::string& key) {
    JNIEnv* env = getJNIEnv();
    jstring jKey = latin1ToJString(env, key);
    auto jValue = (jstring) env->CallObjectMethod(m_androidManagerJObject, m_midGetLaunchIntentExtra, jKey);
    env->DeleteLocalRef(jKey);
    if (!jValue) return "";
    std::string result = getStringFromJString(jValue);
    env->DeleteLocalRef(jValue);
    return result;
}

void AndroidManager::showInputPreview(const std::string& text, int widgetX, int widgetY, int widgetW, int widgetH) {
    JNIEnv* env = getJNIEnv();
    jstring jText = latin1ToJString(env, text);
    env->CallVoidMethod(m_androidManagerJObject, m_midShowInputPreview, jText, (jint)widgetX, (jint)widgetY, (jint)widgetW, (jint)widgetH);
    env->DeleteLocalRef(jText);
}

void AndroidManager::updateInputPreview(const std::string& text) {
    JNIEnv* env = getJNIEnv();
    jstring jText = latin1ToJString(env, text);
    env->CallVoidMethod(m_androidManagerJObject, m_midUpdateInputPreview, jText);
    env->DeleteLocalRef(jText);
}

void AndroidManager::hideInputPreview() {
    JNIEnv* env = getJNIEnv();
    env->CallVoidMethod(m_androidManagerJObject, m_midHideInputPreview);
}

std::string AndroidManager::getClipboardText() {
    JNIEnv* env = getJNIEnv();
    auto jText = (jstring) env->CallObjectMethod(m_androidManagerJObject, m_midGetClipboardText);
    if (!jText) return "";
    std::string result = getStringFromJString(jText);
    env->DeleteLocalRef(jText);
    return result;
}

void AndroidManager::setClipboardText(const std::string& text) {
    JNIEnv* env = getJNIEnv();
    jstring jText = latin1ToJString(env, text);
    env->CallVoidMethod(m_androidManagerJObject, m_midSetClipboardText, jText);
    env->DeleteLocalRef(jText);
}

void AndroidManager::unZipAssetData() {
    std::string destFolder = getAppBaseDir() + "/game_data/";

    const std::filesystem::path initLua { destFolder + "init.lua" };
    if (std::filesystem::exists(initLua)) {
        return;
    }

    AAsset* dataAsset = AAssetManager_open(
            m_app->activity->assetManager,
            "data.zip",
            AASSET_MODE_BUFFER);

    if (!dataAsset) {
        g_logger.fatal("Failed to open data.zip from APK assets. Run setup_android_deps.sh to generate it.");
        return;
    }

    auto dataFileLength = AAsset_getLength(dataAsset);
    char* dataContent = (char *) malloc(dataFileLength + 1);
    AAsset_read(dataAsset, dataContent, dataFileLength);
    dataContent[dataFileLength] = '\0';

    unzipper::extract(dataContent, dataFileLength, destFolder);

    AAsset_close(dataAsset);
    free(dataContent);
}

std::string AndroidManager::getAppBaseDir() {
    return { m_app->activity->internalDataPath };
}

std::string AndroidManager::getStringFromJString(jstring text) {
    JNIEnv* env = getJNIEnv();

    const jchar* chars = env->GetStringChars(text, nullptr);
    const jsize length = env->GetStringLength(text);

    std::string result;
    result.reserve(length);

    for (jsize i = 0; i < length; ++i) {
        const jchar codePoint = chars[i];
        if (codePoint <= 0xFF) {
            result.push_back(static_cast<char>(codePoint));
        } else {
            // fallback for characters outside ISO-8859-1 range
            result.push_back('?');
        }
    }

    env->ReleaseStringChars(text, chars);

    return result;
}

float AndroidManager::getScreenDensity() {
    JNIEnv* jni = getJNIEnv();

    return jni->CallFloatMethod(m_androidManagerJObject, m_midGetDisplayDensity);
}

void AndroidManager::attachToAppMainThread() {
    getJNIEnv();
}

JNIEnv* AndroidManager::getJNIEnv() {
    JNIEnv *env;

    if (m_app->activity->vm->AttachCurrentThread(&env, nullptr) < 0) {
        g_logger.fatal("Failed to attach current thread");
        return nullptr;
    }

    return env;
}

/*
 * Java JNI functions
*/
extern "C" {

void Java_com_otclient_AndroidManager_nativeInit(JNIEnv* env, jobject androidManager) {
    g_androidManager.setAndroidManager(env, androidManager);
}

void Java_com_otclient_AndroidManager_nativeSetAudioEnabled(JNIEnv*, jobject, jboolean enabled) {
    g_sounds.setAudioEnabled(enabled);
}

// ── GameLauncherModule bridge ────────────────────────────────────────────────
// Chamados pelo Kotlin (GameLauncherModule) quando o React Native pede algo.
// As respostas são enviadas de volta via sendEventToReact().

/**
 * Envia um evento para o React Native via GameLauncherModule.
 * Chama GameLauncherModule.sendEventFromNative(eventName, data) no Kotlin.
 */
static void sendEventToReact(JNIEnv* env, const std::string& eventName, const std::string& jsonData) {
    // Localiza a classe GameLauncherModule
    jclass cls = env->FindClass("com/otclient/GameLauncherModule");
    if (!cls) return;

    jmethodID mid = env->GetStaticMethodID(cls,
        "sendEventFromNative",
        "(Ljava/lang/String;Lcom/facebook/react/bridge/WritableMap;)V");
    if (!mid) { env->DeleteLocalRef(cls); return; }

    // Cria WritableMap via JavaOnlyMap (disponível no runtime do React Native)
    jclass mapCls = env->FindClass("com/facebook/react/bridge/Arguments");
    jmethodID createMap = env->GetStaticMethodID(mapCls, "createMap",
        "()Lcom/facebook/react/bridge/WritableMap;");
    jobject writableMap = env->CallStaticObjectMethod(mapCls, createMap);

    // Coloca os dados JSON como string "data" no mapa
    // (O JS pode JSON.parse se precisar de estrutura complexa)
    jclass writableMapCls = env->GetObjectClass(writableMap);
    jmethodID putString = env->GetMethodID(writableMapCls, "putString",
        "(Ljava/lang/String;Ljava/lang/String;)V");
    jstring jKey  = env->NewStringUTF("data");
    jstring jData = env->NewStringUTF(jsonData.c_str());
    env->CallVoidMethod(writableMap, putString, jKey, jData);

    jstring jEvent = env->NewStringUTF(eventName.c_str());
    env->CallStaticVoidMethod(cls, mid, jEvent, writableMap);

    env->DeleteLocalRef(jKey);
    env->DeleteLocalRef(jData);
    env->DeleteLocalRef(jEvent);
    env->DeleteLocalRef(writableMap);
    env->DeleteLocalRef(writableMapCls);
    env->DeleteLocalRef(mapCls);
    env->DeleteLocalRef(cls);
}

/**
 * Chamado pelo Kotlin quando o React Native pede a lista de personagens.
 * Aqui o OTClient deve conectar ao servidor, enviar o pacote de login Tibia
 * e quando receber a resposta chamar sendEventToReact("OTC_CharacterList", json).
 *
 * TODO: integrar com o protocolo de login do OTClient (ProtocolLogin).
 * Por agora emite um evento de placeholder para validar o fluxo end-to-end.
 */
void Java_com_otclient_GameLauncherModule_nativeRequestCharacterList(
        JNIEnv* env, jobject, jstring jHost, jstring jPort, jstring jAccount, jstring jPassword) {

    const char* host     = env->GetStringUTFChars(jHost,     nullptr);
    const char* port     = env->GetStringUTFChars(jPort,     nullptr);
    const char* account  = env->GetStringUTFChars(jAccount,  nullptr);
    const char* password = env->GetStringUTFChars(jPassword, nullptr);

    g_logger.info(std::string("[Bridge] requestCharacterList: ") + host + ":" + port + " acc=" + account);

    // TODO: chamar g_game.loginToServer(host, atoi(port), account, password)
    // e aguardar o callback onLoginSuccess(characters) / onLoginError(msg).
    //
    // Placeholder: emite lista de personagens de teste para validar o fluxo RN.
    std::string json = R"({"characters":[{"name":"Goku","level":999,"vocation":"Knight","isOnline":false}]})";
    sendEventToReact(env, "OTC_CharacterList", json);

    env->ReleaseStringUTFChars(jHost,     host);
    env->ReleaseStringUTFChars(jPort,     port);
    env->ReleaseStringUTFChars(jAccount,  account);
    env->ReleaseStringUTFChars(jPassword, password);
}

/**
 * Chamado pelo Kotlin quando o React Native pede o status do servidor.
 * TODO: implementar via protocolo Tibia (status server port 7171).
 */
void Java_com_otclient_GameLauncherModule_nativeRequestServerStatus(
        JNIEnv* env, jobject, jstring jHost, jstring jPort) {

    const char* host = env->GetStringUTFChars(jHost, nullptr);
    const char* port = env->GetStringUTFChars(jPort, nullptr);

    g_logger.info(std::string("[Bridge] requestServerStatus: ") + host + ":" + port);

    // Placeholder: emite status de teste
    std::string json = R"({"online":true,"playersOnline":42,"motd":"Bem-vindo ao Dragon Ball OTS!"})";
    sendEventToReact(env, "OTC_ServerStatus", json);

    env->ReleaseStringUTFChars(jHost, host);
    env->ReleaseStringUTFChars(jPort, port);
}

/**
 * Chamado pelo Kotlin quando o React Native quer voltar ao Launcher.
 */
void Java_com_otclient_GameLauncherModule_nativeReturnToLauncher(JNIEnv*, jobject) {
    g_logger.info("[Bridge] returnToLauncher requested");
    // O OTClient deve encerrar o loop de jogo e finalizar a GameActivity.
    // TODO: chamar g_game.logout() e fechar a activity.
    sendEventToReact(nullptr, "OTC_GameClosed", "{}");
}

} // extern "C"

#endif
