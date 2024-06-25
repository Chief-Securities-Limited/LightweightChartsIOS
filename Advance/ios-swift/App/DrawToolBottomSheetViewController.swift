//
//  DrawToolBottomSheet.swift
//  Example
//
//  Created by Liven on 2024/5/7.
//  Copyright © 2024 Example Inc. All rights reserved.
//

import UIKit
import PanModal

enum DrawType: String, CaseIterable {
    case trend_line
    case arrow
    case ray
    case info_line
    case extended_line
    case trend_angle
    case horizontal_line
    case horizontal_ray
    case vertical_line
    case cross_line
    case parallel_channel
    case regression_trend
    case flat_bottom
    case disjoint_angle
    case anchored_vwap
}


class DrawToolBottomSheetViewController: UIViewController {
    public var dataArray: [String] = DrawType.allCases.map({ $0.rawValue })
    public var didSelectedDrawToolCallBack: ((String) -> Void)?
    
    public lazy var tableView: UITableView = {
        let tableview = UITableView(frame: .zero, style: .plain)
        tableview.delegate = self
        tableview.dataSource = self
        tableview.separatorStyle = .none
        tableview.register(TradingViewSingleCell.self, forCellReuseIdentifier: TradingViewSingleCell.description())
        tableview.rowHeight = UITableView.automaticDimension
        tableview.showsVerticalScrollIndicator = false
        tableview.showsHorizontalScrollIndicator = false
        tableview.translatesAutoresizingMaskIntoConstraints = false
        return tableview
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViews()
    }
    
    func setupViews() {
        view.addSubview(tableView)
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
    }
}

extension DrawToolBottomSheetViewController: UITableViewDelegate, UITableViewDataSource {
    open func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        dataArray.count
    }
    
    open func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: TradingViewSingleCell.description(), for: indexPath)
        if let cell = cell as? TradingViewSingleCell {
            cell.titleLabel.text = dataArray[indexPath.row]
        }
        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 44.0
    }
    
    open func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        didSelectedDrawToolCallBack?(dataArray[indexPath.row])
        dismiss(animated: true)
    }
    
    open func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        return nil
    }
    
    open func tableView(_ tableView: UITableView, viewForFooterInSection section: Int) -> UIView? {
        return nil
    }
    
    open func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        .leastNonzeroMagnitude
    }
    
    open func tableView(_ tableView: UITableView, heightForFooterInSection section: Int) -> CGFloat {
        .leastNonzeroMagnitude
    }
}

extension DrawToolBottomSheetViewController: PanModalPresentable {
    public var panScrollable: UIScrollView? {
        tableView
    }
    
    public var cornerRadius: CGFloat {
        20
    }
    
    public var longFormHeight: PanModalHeight {
        .contentHeight(400)
    }
    
    public var showDragIndicator: Bool {
        false
    }
}


class TradingViewSingleCell: UITableViewCell {
    lazy var titleLabel: UILabel = {
        let label = UILabel()
        label.textColor = .black
        label.font = .systemFont(ofSize: 14)
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    lazy var dividerView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        selectionStyle = .none
        setupView()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
  
    func setupView() {
        contentView.addSubview(titleLabel)
        contentView.addSubview(dividerView)
        NSLayoutConstraint.activate([
            titleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            titleLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 8),
            titleLabel.bottomAnchor.constraint(equalTo: dividerView.topAnchor, constant: -8),
           
            dividerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            dividerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            dividerView.heightAnchor.constraint(equalToConstant: 0.5),
            dividerView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])
    }

}
