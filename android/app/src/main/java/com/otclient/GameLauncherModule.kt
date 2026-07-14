package com.otclient

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class GameLauncherModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "GameLauncher"
    }

    @ReactMethod
    fun launchGame(serverIp: String, port: String, accountName: String, loginToken: String, characterName: String) {
        val context = reactApplicationContext
        val intent = Intent(context, GameActivity::class.java).apply {
            putExtra("serverIp", serverIp)
            putExtra("serverPort", port)
            putExtra("accountName", accountName)
            putExtra("loginToken", loginToken)
            putExtra("characterName", characterName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}
