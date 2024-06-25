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

class ViewController: UIViewController, WKScriptMessageHandler {
   
    private lazy var mainWebView: WKWebView = {
        let configuration = WKWebViewConfiguration()
        configuration.userContentController.add(self, name: "getBars")
        configuration.userContentController.add(self, name: "crossHairMoved")
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
            
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
    
    private lazy var volChartView: WKWebView = {
        let configuration = WKWebViewConfiguration()
        configuration.userContentController.add(self, name: "getBars")
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
            
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.navigationDelegate = self
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        webView.translatesAutoresizingMaskIntoConstraints = false
        return webView
    }()
    
    private lazy var drawButton: UIButton = {
        let btn = UIButton(type: .custom)
        btn.translatesAutoresizingMaskIntoConstraints = false
        btn.setTitle("Draw", for: .normal)
        btn.setTitleColor(.blue, for: .normal)
        btn.addTarget(self, action: #selector(startDrawing), for: .touchUpInside)
        btn.layer.borderColor = UIColor.blue.cgColor
        btn.layer.borderWidth = 0.5
        return btn
    }()
   
    override func viewDidLoad() {
        super.viewDidLoad()
        setupGestureRecognizer()
        view.addSubview(mainWebView)
//        view.addSubview(volChartView)
//        view.addSubview(drawButton)
        
        NSLayoutConstraint.activate([
            mainWebView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 10),
            mainWebView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 0),
            mainWebView.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: 0),
//            mainWebView.heightAnchor.constraint(equalToConstant: 206),
            // 大视图
            mainWebView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: 0),
            // 小时图
            // webView.widthAnchor.constraint(equalToConstant: 231),
//            
//            volChartView.topAnchor.constraint(equalTo: mainWebView.bottomAnchor, constant: 80),
//            volChartView.leadingAnchor.constraint(equalTo: mainWebView.leadingAnchor),
//            volChartView.trailingAnchor.constraint(equalTo: mainWebView.trailingAnchor),
//            volChartView.heightAnchor.constraint(equalToConstant: 62),
            
//            drawButton.leadingAnchor.constraint(equalTo: mainWebView.leadingAnchor),
//            drawButton.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.25),
//            drawButton.topAnchor.constraint(equalTo: volChartView.bottomAnchor, constant: 40),
//            drawButton.heightAnchor.constraint(equalToConstant: 44)
        ])
        
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html") else {
            print("No file at url")
            return
        }
        mainWebView.loadFileURL(url, allowingReadAccessTo: url)
//        volChartView.loadFileURL(url, allowingReadAccessTo: url)
    }
    
    private func setupGestureRecognizer() {
        let panGes = UIPanGestureRecognizer(target: self, action: #selector(handlePanGesture(_:)))
        panGes.delegate = self
        view.addGestureRecognizer(panGes)
        
        let longPressGestureRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPressGesture(_:)))
        longPressGestureRecognizer.minimumPressDuration = 0.4
        view.addGestureRecognizer(longPressGestureRecognizer)

    }
    
    @objc private func handleLongPressGesture(_ recognizer: UILongPressGestureRecognizer) {
//        if recognizer.state == .began || recognizer.state == .changed {
//
//            let location = recognizer.location(in: view)
//            if mainWebView.frame.contains(location) {
//                let location = view.convert(location, to: mainWebView)
//                print("ges: ========== location \(location)")
//                chartHistogram.setGridLinePoint(point: tapLocationInSubview1)
//                CXLightweightChartProxy.shared.currentDelegate = chartHistogram
//                let tapLocationInSubview2 = convert(location, to: chartline)
//                chartline.setGridLinePoint(point: tapLocationInSubview2, hiddenXTips: true)
                
//            } 
//            
//        } else {
//            longPressGestureTargeted = false
//            chartHistogram.hiddenGridLines()
//            chartline.hiddenGridLines()
//            chartHistogram.clearFlow()
//            chartline.clearFlow()
//            CXLightweightChartProxy.shared.currentDelegate = nil
//            OrderEntryRedisDataFetcher.shared.cancel = false
//        }
    }
    
    @objc private func handlePanGesture(_ gesture: UIPanGestureRecognizer) {
        let location = gesture.location(in: mainWebView)
        let script = "handlePanGesture(\(location.x), \(location.y));"
        print("ges: ===== \(script)")
        mainWebView.evaluateJavaScript(script, completionHandler: nil)
        
//        let translation = gesture.translation(in: self.view)
//        let location = gesture.location(in: self.view)
//
//        // scroll direction
//        var isScrollUpDownDirection: Bool = true
//        if abs(translation.x) > abs(translation.y) {
//            isScrollUpDownDirection = false
//        }
//        
//        print("ges: ========== translation \(translation)")
//        
//        // chartView ges target
//        if gesture.state == .began  {
////            if chartHistogram.frame.contains(location) {
////                CXLightweightChartProxy.shared.currentDelegate = chartHistogram
////            } else if chartline.frame.contains(location) {
////                CXLightweightChartProxy.shared.currentDelegate = chartline
////            } else {
////                CXLightweightChartProxy.shared.currentDelegate = nil
////            }
//            
//        }  else  {
////            chartHistogram.hiddenGridLines()
////            chartline.hiddenGridLines()
////            chartHistogram.clearFlow()
////            chartline.clearFlow()
//        }
//        
//        // update tableView scroll contentOffset
////        guard CXLightweightChartProxy.shared.currentDelegate == nil || isScrollUpDownDirection else {
////            return
////        }
////        if let scrollView = parentScrollView {
////            let contentOffsetY = scrollView.contentOffset.y - translation.y
////            parentScrollView?.setContentOffset(CGPoint(x: 0, y: max(0, contentOffsetY)), animated: false)
////        }
//        if gesture.state == .changed || gesture.state == .ended || gesture.state == .cancelled {
//            gesture.setTranslation(.zero, in: self.view)
//        }
    }
    
   
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
    }

}


extension ViewController: UIGestureRecognizerDelegate {
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return true
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
            
            self.volChartView.evaluateJavaScript("getBarsDataCallBack('\(jsonString)')", completionHandler: { result, error in
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
    @objc func startDrawing() {
        let vc = DrawToolBottomSheetViewController()
        vc.didSelectedDrawToolCallBack = { type in
            self.mainWebView.evaluateJavaScript("drawTool('\(type)')", completionHandler: { _, _ in
            })
        }
        presentPanModal(vc)
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
