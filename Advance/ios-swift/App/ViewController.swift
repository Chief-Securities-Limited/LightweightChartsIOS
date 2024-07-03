//
//  ViewController.swift
//  iOS
//
//  Created by TradingView on 04.10.2018.
//  Copyright © 2023 Example Inc. All rights reserved.
//

import UIKit
import WebKit
import PanModal

struct BarItem: Codable {
    var open: Double
    var high: Double
    var low: Double
    var close: Double
    var time: Int64
    var volume: Int64
}

enum ButtonType: Int, CaseIterable {
    case draw = 10
    case vol
    case macd
    case rsi
}

class ViewController: UIViewController, WKScriptMessageHandler {
    
    private var drawCrosshair = false
   
    private lazy var mainWebView: WKWebView = {
        let configuration = WKWebViewConfiguration()
        configuration.userContentController.add(self, name: "consoleHandler")
        configuration.userContentController.add(self, name: "getBars")
        configuration.userContentController.add(self, name: "crossHairMoved")
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
            
        let script = """
                (function() {
                    var originalLog = console.log;
                    console.log = function(message) {
                        window.webkit.messageHandlers.consoleHandler.postMessage(message);
                        originalLog.apply(console, arguments);
                    };
                })();
                """
        
        let userScript = WKUserScript(source: script, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        configuration.userContentController.addUserScript(userScript)
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.isScrollEnabled = false
        webView.navigationDelegate = self
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        webView.translatesAutoresizingMaskIntoConstraints = false
        return webView
    }()
    
    private lazy var stackView: UIStackView = {
        let view = UIStackView()
        view.axis = .horizontal
        view.distribution = .fillEqually
        view.spacing = 8
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
   
    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(mainWebView)
        view.addSubview(stackView)
        setupButtons()
        
        NSLayoutConstraint.activate([
            mainWebView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 10),
            mainWebView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 0),
            mainWebView.bottomAnchor.constraint(equalTo: stackView.topAnchor, constant: -20),
            mainWebView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: 0),

            stackView.leadingAnchor.constraint(equalTo: mainWebView.leadingAnchor, constant: 16),
            stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            stackView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20),
            stackView.heightAnchor.constraint(equalToConstant: 44)
        ])
        
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html") else {
            print("No file at url")
            return
        }
        mainWebView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }
   
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
    }
    
    func setupButtons() {
        stackView.addArrangedSubview(buildButton(title: "Draw", type: .draw))
        stackView.addArrangedSubview(buildButton(title: "VOL", type: .vol))
        stackView.addArrangedSubview(buildButton(title: "MACD", type: .macd))
        stackView.addArrangedSubview(buildButton(title: "RSI", type: .rsi))
    }
    
    func buildButton(title: String, type: ButtonType) -> UIButton {
        let btn = UIButton(type: .custom)
        btn.translatesAutoresizingMaskIntoConstraints = false
        btn.setTitle(title, for: .normal)
        btn.setTitleColor(.blue, for: .normal)
        btn.addTarget(self, action: #selector(buttonClickAction(sender:)), for: .touchUpInside)
        btn.layer.borderColor = UIColor.blue.cgColor
        btn.layer.borderWidth = 0.5
        btn.tag = type.rawValue
        return btn
    }

}


// MARK: - Data
extension ViewController {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        let name = message.name
        if name == "getBars" {
            /**
             请求Bars数据
             messageBody: [
                 "symbol": TEST,
                 "countBack": 301,
                 "from": 1714935715200,
                 "resolution": 1D,
                 "to": 1714961721600,
                 "firstDataRequest": 1]
             */
            if let messageBody = message.body as? [String: Any] {
                if let countBack = messageBody["countBack"] as? Int {
                    fetchBarsData(with: countBack)
                }
            }
            
        } else if name == "crossHairMoved" {
            print("crossHairMoved === \(message.body)")
            
        } else if message.name == "consoleHandler" {
            if let logMessage = message.body as? String {
                print("JavaScript log: \(logMessage)")
            }
        }
    }
    
    func handleJavaScriptCall(_ message: String) {
        // Handle the message sent from JavaScript
        print("Message received from JavaScript: \(message)")
    }
    
    // Fill data to Javascript
    func fetchBarsData(with countBack : Int) {
        let barsData = generateMockData(countBack: countBack, toDate: Date().timeIntervalSince1970)
        let jsonString = formatJSONString(barsData)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.mainWebView.evaluateJavaScript("getBarsDataCallBack('\(jsonString)')", completionHandler: { result, error in
                if let error = error {
                    print("Failed to send marks data: \(error)")
                }
            })
        }
    }
    
    //MARK: - Util
    func formatJSONString(_ data: [BarItem]) -> String {
        do {
            let encoder = JSONEncoder()
            let jsonData = try encoder.encode(data)
            let jsonString = String(data: jsonData, encoding: .utf8)!
                    .replacingOccurrences(of: "\n", with: "")
                    .replacingOccurrences(of: "\\", with: "")
            return jsonString
        } catch {
            print(error.localizedDescription)
            return ""
        }
    }
    
    //MARK: - Mock Data
    func generateMockData(countBack: Int, toDate: TimeInterval) -> [BarItem] {
        var bars = [BarItem]()
        var price = 100.0 // 初始价格
        let volume = Int64(100)
        let volatility = 0.1 // 价格波动率

        // 创建一个日期组件，用于回溯时间
        var date = Date(timeIntervalSince1970: toDate)
        var calendar = Calendar.current
        calendar.timeZone = TimeZone(secondsFromGMT: 0)! // 使用 UTC 时区

        // 回溯时间，从给定的 `to` 时间开始，每次减去一天
        for _ in 1...countBack {
            date = calendar.date(byAdding: .day, value: -1, to: date)!

            // 创建一个 Bar 实例
            let bar = BarItem(
                open: price,
                high: price,
                low: price,
                close: price,
                time: Int64(date.timeIntervalSince1970 * 1000),
                volume: volume// 转换为毫秒
            )
            bars.append(bar)

            // 价格随机波动逻辑
            let x = Double.random(in: -0.5...0.5)
            let changePercent = 2 * volatility * x
            let changeAmount = price * changePercent
            price += changeAmount
        }

        return bars.reversed()
    }
    
}


// MARK: - Draw Tool
extension ViewController {
    @objc func buttonClickAction(sender: UIButton) {
        guard let type = ButtonType(rawValue: sender.tag) else {
            return
        }
        
        switch type {
        case .draw:
            let vc = DrawToolBottomSheetViewController()
            vc.didSelectedDrawToolCallBack = { type in
                self.mainWebView.evaluateJavaScript("drawTool('\(type)')", completionHandler: { _, _ in
                })
            }
            presentPanModal(vc)
            
        case .vol:
            break
        case .macd:
            break
        case .rsi:
            break
        }
    }
}


extension ViewController: WKNavigationDelegate {
  func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    if navigationAction.navigationType == .other {
      if let url = navigationAction.request.url,
         let host = url.host, host.hasPrefix("www.tradingview.com"),
        UIApplication.shared.canOpenURL(url) {
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
        return
      } else {
        decisionHandler(.allow)
        return
      }
    } else {
      decisionHandler(.cancel)
      return
    }
  }
}


extension String {
    func trimIndent() -> String {
        let lines = self.split(separator: "\n", omittingEmptySubsequences: false)
        let indentLevels = lines.map { $0.prefix(while: { $0.isWhitespace }).count }
        let minIndent = indentLevels.filter { $0 > 0 }.min() ?? 0

        return lines.map { line in
            String(line.dropFirst(min(minIndent, line.count)))
        }.joined(separator: "\n")
    }
}
