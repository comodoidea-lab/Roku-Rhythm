package com.comodoidealab.rokurhythm;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

import java.util.Calendar;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeReceiptSharePlugin.class);
        super.onCreate(savedInstanceState);
        applyEdgeToEdgeStatusBar();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyEdgeToEdgeStatusBar();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyEdgeToEdgeStatusBar();
        }
    }

    private void applyEdgeToEdgeStatusBar() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setStatusBarContrastEnforced(false);
        }

        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        boolean useDarkStatusBarIcons = hour >= 5 && hour < 16;
        View decorView = getWindow().getDecorView();
        int systemUiVisibility = decorView.getSystemUiVisibility()
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;

        if (useDarkStatusBarIcons) {
            systemUiVisibility |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        } else {
            systemUiVisibility &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        }
        decorView.setSystemUiVisibility(systemUiVisibility);

        WindowInsetsControllerCompat insetsController =
            WindowCompat.getInsetsController(getWindow(), decorView);
        insetsController.setAppearanceLightStatusBars(useDarkStatusBarIcons);
    }
}
