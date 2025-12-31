import Foundation

public class SeriesObject: JavaScriptObject {
    
    static var name: String { String(describing: self) }
    
    let jsName: String
    
    weak var context: JavaScriptEvaluator? // 25.12.31 处理 unowned 造成的崩溃问题
    weak var closureStore: ClosuresStore?
    
    required init(context: JavaScriptEvaluator?, closureStore: ClosuresStore?) {
        self.context = context
        self.closureStore = closureStore
        self.jsName = Self.name + .uniqueString
    }
    
}
