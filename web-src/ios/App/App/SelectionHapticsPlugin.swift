import Capacitor
import UIKit

/// Light "tick" used when the selected date moves by one day on the chart.
@objc(SelectionHapticsPlugin)
public class SelectionHapticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SelectionHapticsPlugin"
    public let jsName = "SelectionHaptics"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "selectionChanged", returnType: CAPPluginReturnPromise)
    ]

    private var generator: UISelectionFeedbackGenerator?

    @objc func selectionChanged(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let generator = self.generator ?? UISelectionFeedbackGenerator()
            self.generator = generator
            generator.selectionChanged()
            // Keep the Taptic Engine ready for the next day while dragging.
            generator.prepare()
            call.resolve()
        }
    }
}

/// Registers the app-local plugin above with the Capacitor bridge.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SelectionHapticsPlugin())
    }
}
