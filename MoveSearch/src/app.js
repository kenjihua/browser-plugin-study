import React from 'react'
import axios from 'axios'
import './app.less'

const MODAL_WIDTH = 350

const API = {
  a: 'https://kaifa.baidu.com/rest/v1/search', // 百度开发平台
  b: 'https://movesearch.vercel.app/api/baidu', // 反向代理到百度开发平台
}

export default class extends React.Component {
  state = { show: true, data: [] }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseup)
  }

  handleMouseup = (e) => {
    var selectionObj = window.getSelection()
    var selectedText = selectionObj.toString()
    console.log('selectedText', selectedText)
    if (selectedText.length !== 0) {
      var selectionObjRect = selectionObj.getRangeAt(0).getBoundingClientRect()
      const modalPosition = this.getModalPosition(selectionObjRect)
      this.setState({ modalPosition })

      this.getSearchAPI({ selectedText })
    } else {
      // 未划词时判断是否关闭弹窗
      if (this.isCloseModal(e)) {
        this.setState({ show: false, data: [] })
      }
    }
  }

  getSearchAPI = ({ selectedText }) => {
    return axios
      .get(
        `${API.a}?query=${selectedText}&pageNum=1&pageSize=10`
      )
      .then((res) => {
        let { data } = res.data.data.documents
        console.log(data)
        if (data.length) {
          this.setState({
            data: data,
            show: true,
            selectedText: selectedText,
          })
        }
      })
  }

  // 判断是否关闭弹窗
  isCloseModal = (e) => {
    if (this.state.show) {
      // 重新计算是否关闭弹窗
      // 检测鼠标位置是否在弹窗内，不是则关闭弹窗
      const inModal = this.boundaryDetection(
        e.clientX,
        e.clientY,
        this.state.modalPosition
      )
      return !inModal
    }
    return false
  }

  // 计算弹窗位置
  getModalPosition = (selectionObjRect) => {
    const { x, y, height, width } = selectionObjRect // 获取选中文字的位置，x y是横纵坐标，height width是选中文字的高度和宽度
    // 计算弹窗位置，算出left和top
    let left = x - MODAL_WIDTH / 2 + width / 2
    left = left > 10 ? left : 10
    const top = y + height
    const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    return {
      left: left + scrollLeft,
      top: top + scrollTop,
    }
  }

  /**
   * 边界检测，鼠标点击modal之外，modal隐藏
   * @param {*} x 鼠标的x轴位置
   * @param {*} y 鼠标的y轴位置
   * @param {*} modalPosition 弹窗的left和top
   */
  boundaryDetection = (x, y, modalPosition = { left: 0, top: 0 }) => {
    let { left, top } = modalPosition
    if (
      x > left &&
      x < left + MODAL_WIDTH &&
      y > top &&
      y < top + MoveSearchApp.offsetHeight
    ) {
      return true
    }
    return false
  }

  render() {
    let { show, selectedText, modalPosition, data } = this.state
    return (
        <>{show && data && data.length ? (
          <div
            className="move-search"
            id="MoveSearchApp"
            style={{ ...modalPosition }}
          >
            <div className="move-search-content">
              <ul className="move-search-ul">
                {data.map((l) => (
                  <li className="move-search-li" key={l.id}>
                    <a href={l.url} target="_blank">
                      {l.title}
                    </a>
                    <span>{l.summary}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="move-search-bottom-fade"></div>
            <footer className="move-search-footer">
              <a
                href={`https://kaifa.baidu.com/searchPage?wd=${selectedText}`}
                target="_blank"
              >
                Read More
              </a>
            </footer>
          </div>
        ) : null}</>
    )
  }
}