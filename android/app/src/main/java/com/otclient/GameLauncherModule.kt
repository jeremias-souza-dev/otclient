package com.otclient

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * GameLauncherModule — Ponte bidirecional React Native ↔ OTClient C++
 *
 * React → OTClient : chamadas de método via NativeModules.GameLauncher
 * OTClient → React : eventos via DeviceEventEmitter (emitidos do C++ via JNI)
 *
 * Eventos emitidos para o React Native:
 *   "OTC_CharacterList"  — lista de personagens recebida do servidor
 *   "OTC_LoginError"     — erro de login (conta/senha inválidos, etc.)
 *   "OTC_GameStarted"    — jogo iniciou com sucesso
 *   "OTC_GameClosed"     — jogo fechou / voltou para o launcher
 *   "OTC_ServerStatus"   — status do servidor (online/offline, players online)
 */
class GameLauncherModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    companion object {
        // Singleton para o C++ (via JNI) conseguir emitir eventos
        @Volatile private var instance: GameLauncherModule? = null

        @JvmStatic
        fun getInstance(): GameLauncherModule? = instance

        // Chamado pelo C++ via JNI para enviar eventos ao React Native
        @JvmStatic
        fun sendEventFromNative(eventName: String, data: WritableMap) {
            instance?.emitEvent(eventName, data)
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = "GameLauncher"

    // ── React → OTClient ────────────────────────────────────────────────────

    /**
     * Lança o jogo: abre a GameActivity passando credenciais e personagem.
     * O OTClient C++ lê os extras do Intent via getLaunchIntentExtra().
     */
    @ReactMethod
    fun launchGame(serverIp: String, port: String, accountName: String, loginToken: String, characterName: String) {
        val intent = Intent(reactContext, GameActivity::class.java).apply {
            putExtra("serverIp",       serverIp)
            putExtra("serverPort",     port)
            putExtra("accountName",    accountName)
            putExtra("loginToken",     loginToken)
            putExtra("characterName",  characterName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }

    /**
     * Solicita ao OTClient que busque a lista de personagens do servidor.
     * O OTClient emite "OTC_CharacterList" ou "OTC_LoginError" como resposta.
     */
    @ReactMethod
    fun requestCharacterList(serverIp: String, port: String, accountName: String, password: String) {
        nativeRequestCharacterList(serverIp, port, accountName, password)
    }

    /**
     * Solicita status do servidor (players online, se está ativo, etc.)
     * O OTClient emite "OTC_ServerStatus" como resposta.
     */
    @ReactMethod
    fun requestServerStatus(serverIp: String, port: String) {
        nativeRequestServerStatus(serverIp, port)
    }

    /**
     * Volta do jogo para o launcher React Native.
     * Fecha a GameActivity e retorna para a LauncherActivity.
     */
    @ReactMethod
    fun returnToLauncher() {
        nativeReturnToLauncher()
    }

    // ── OTClient → React (chamado pelo C++ via JNI) ─────────────────────────

    fun emitEvent(eventName: String, data: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, data)
    }

    // Necessário para o React Native não avisar sobre listeners
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    // ── JNI — implementados no C++ (androidmanager.cpp) ─────────────────────

    private external fun nativeRequestCharacterList(host: String, port: String, account: String, password: String)
    private external fun nativeRequestServerStatus(host: String, port: String)
    private external fun nativeReturnToLauncher()
}
