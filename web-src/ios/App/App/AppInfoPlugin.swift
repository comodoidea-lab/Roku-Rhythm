import Capacitor
import Foundation

/// Exposes the bundle's real version so Settings matches App Store / TestFlight.
@objc(AppInfoPlugin)
public class AppInfoPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppInfoPlugin"
    public let jsName = "AppInfo"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getInfo", returnType: CAPPluginReturnPromise)
    ]

    @objc func getInfo(_ call: CAPPluginCall) {
        let info = Bundle.main.infoDictionary ?? [:]
        call.resolve([
            "version": info["CFBundleShortVersionString"] as? String ?? "",
            "build": info["CFBundleVersion"] as? String ?? ""
        ])
    }
}
