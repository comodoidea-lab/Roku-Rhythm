package com.comodoidealab.rokurhythm;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;

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

    private void applyEdgeToEdgeStatusBar() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setStatusBarContrastEnforced(false);
        }

        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        boolean useDarkStatusBarIcons = hour >= 5 && hour < 16;
        WindowInsetsControllerCompat insetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        insetsController.setAppearanceLightStatusBars(useDarkStatusBarIcons);
    }
}
