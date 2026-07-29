package com.comodoidealab.rokurhythm;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeReceiptSharePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
