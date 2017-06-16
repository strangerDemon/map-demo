using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using BLL;
using Model;
using System.Web.Script.Services;
using System.Web.Script.Serialization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Collections.Specialized;
using System.IO;
using System.Drawing;
using UtilityClass;
using System.Security.Cryptography;
/// <summary>
/// 接口
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.ComponentModel.ToolboxItem(false)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class xmtdt : System.Web.Services.WebService
{

    //请求参数
    JObject joPara = null;
    //token
    private static TokenModel tokenModel = null;
    public DataResult oDataResult = new DataResult();
    public xmtdt()
    {
        initVRequest();
    }


    #region  1. 获取即将或者正在进行的赛事列表
    /// <summary>
    /// 获取即将或者正在进行的赛事列表
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "1. 获取即将或者正在进行的赛事列表")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getMLSList(string para)
    {
        try
        {
            BLL.MlsMarathonBLL objBll = new MlsMarathonBLL();
            IList<MlsMarathonModel> list = objBll.getMLSList();

            ReturnData(1, "成功", list);
        }
        catch (Exception ex)
        {
            ErrorUtil.RecordErrorToFile(ex, joPara, Context);
            ReturnData(0, ex.Message, "");
        }
        finally
        {
            Context.Response.End();
        }
    }
    #endregion

    #region 2. 用户登录验证
    /// <summary>
    /// 获取即将或者正在进行的赛事列表
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "2. 用户登录验证")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void loginVerification(string para)
    {
        try
        {
            string mlsCode = joPara["mlsCode"].ToString();
            string userCode = joPara["userCode"].ToString();
            string pwd = joPara["pwd"].ToString();

            BLL.MlsUserBLL objBll = new MlsUserBLL();
            IList<Model.MlsUserModel> list = objBll.GetLoginUser(mlsCode, userCode, pwd);

            if (list == null || list.Count < 1)
            {
                ReturnData(0, "失败", null);
            }
            else
            {
                BLL.MlsDataBLL dataBll = new MlsDataBLL();
                IList<Model.MlsDataModel> dataList = dataBll.GetDataByCode("{'userCode':'" + userCode + "'}");
                ReturnData(1, "成功", list[0]);
            }
        }
        catch (Exception ex)
        {
            ErrorUtil.RecordErrorToFile(ex, joPara, Context);
            ReturnData(0, ex.Message, "");
        }
        finally
        {
            Context.Response.End();
        }
    }
    #endregion

    #region 3. 根据用户名称或者编号获取用户列表
    /// <summary>
    /// 获取即将或者正在进行的赛事列表
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "3. 根据用户名称或者编号获取用户列表")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getUserListByCodeOrName(string para)
    {
        try
        {
            string keyword = joPara["keyword"].ToString();

            BLL.MlsUserBLL objBll = new MlsUserBLL();
            IList<Model.MlsUserModel> list = objBll.GetUserByCodeOrName(keyword);

            if (list == null || list.Count < 1)
            {
                ReturnData(0, "失败", null);
            }
            else
            {
                ReturnData(1, "成功", list);
            }
        }
        catch (Exception ex)
        {
            ErrorUtil.RecordErrorToFile(ex, joPara, Context);
            ReturnData(0, ex.Message, "");
        }
        finally
        {
            Context.Response.End();
        }
    }
    #endregion

    #region 4. 获取运动员分布数据
    /// <summary>
    /// 获取运动员分布数据
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "4. 获取运动员分布数据")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getUserPositionSituation(string para)
    {
        try
        {

            ReturnData(1, "成功", "");
        }
        catch (Exception ex)
        {
            ErrorUtil.RecordErrorToFile(ex, joPara, Context);
            ReturnData(0, ex.Message, "");
        }
        finally
        {
            Context.Response.End();
        }
    }
    #endregion

    #region 5. 根据usercode 获取用户的最后一个数据
    [WebMethod(Description = "5. 根据usercode 获取用户的最后一个数据")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getUserLastMlsData(string para)
    {
        try
        {
            string userCode = joPara["userCode"].ToString();

            BLL.MlsDataBLL dataBll = new MlsDataBLL();
            IList<Model.MlsDataModel> dataList = dataBll.GetDataByCode("{'userCode':'" + userCode + "'}");

            if (dataList == null)//检索失败
            {
                ReturnData(0, "失败", null);
            }
            else if (dataList.Count < 1)
            {//无数据
                ReturnData(0, "null", null);
            }
            else
            {
                ReturnData(1, "成功", dataList[0]);
            }
        }
        catch (Exception ex)
        {
            ErrorUtil.RecordErrorToFile(ex, joPara, Context);
            ReturnData(0, ex.Message, "");
        }
        finally
        {
            Context.Response.End();
        }
    }
    #endregion

    #region 6. 移动端提交的mls_data
    /// <summary>
    /// 移动端提交mls数据的接口
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "6. 移动端提交的mls_data")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void saveMlsData(string para)
    {
        BLL.MlsDataBLL dataBll = new MlsDataBLL();
        IList<Model.MlsDataModel> dataList = dataBll.GetDataByCode("{'userCode':'" + joPara["userCode"].ToString() + "'}");
        MlsDataModel mlsData;

        if (dataList.Count > 0)//更新数据库
        {
            mlsData = dataList[0];
        }
        else//创建记录
        {
            mlsData = new MlsDataModel();
            mlsData.UserCode = joPara["userCode"].ToString();
            mlsData.MlsCode = joPara["mlsCode"].ToString();
            mlsData.ClientCode = joPara["clientCode"].ToString();
        }
        string mlsDataStr = joPara["MlsData"].ToString();
        var mlsDataArray = mlsDataStr.Split('|');
        mlsData.X = double.Parse(mlsDataArray[0].Split(',')[0]);
        mlsData.Y = double.Parse(mlsDataArray[0].Split(',')[1]);
        mlsData.Xl = int.Parse(mlsDataArray[1]);
        mlsData.Sd = float.Parse(mlsDataArray[2]);
        mlsData.Bs = int.Parse(mlsDataArray[3]);
        mlsData.Bp = int.Parse(mlsDataArray[4]);
        mlsData.Tw = float.Parse(mlsDataArray[5]);
        mlsData.Ps = int.Parse(mlsDataArray[6]);
        mlsData.Bf = int.Parse(mlsDataArray[7]);
        mlsData.Distance = decimal.Parse(mlsDataArray[8]);
        mlsData.GetTime = DateTime.Now;
        if (mlsData.Id == null || mlsData.Id == "")//创建
        {
            if (dataBll.Add(mlsData) != null)
            {
                ReturnData(1, "成功", null);
            }
            else
            {
                ReturnData(0, "失败", null);
            }
        }
        else
        {
            if (dataBll.Update(mlsData))//更新成功
            {
                ReturnData(1, "成功", null);
            }
            else
            {
                ReturnData(0, "失败", null);
            }
        }
    }
    #endregion

    #region 7. web端获取实时绘图的点数据
    /// <summary>
    /// web端获取实时绘图的点数据
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "7. web端获取实时绘图的点数据")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getPoints(string para)
    {
        BLL.MlsDataBLL dataBll = new MlsDataBLL();
        IList<Model.MlsDataModel> dataList = dataBll.GetDataByCode("{'order':' user_Code asc '}");
        //[24.4937309384,118.1267599777]
        List<double[]> points = new List<double[]>();
        double[] point = new double[2];
        foreach (MlsDataModel model in dataList)
        {
            point[0] = (double)model.X;
            point[1] = (double)model.Y;
            points.Add(point);
            point = new double[2];
        }

        ReturnData(1, "成功", points);
    }

    #endregion

    #region 8. web端获取实时统计的用户数据
    /// <summary>
    /// web端获取实时统计的用户数据
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "8. web端获取实时统计的用户数据")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getStatistics(string para)
    {
        BLL.MlsDataBLL dataBll = new MlsDataBLL();
        int group = int.Parse(joPara["group"].ToString());//分组大小

        var dataList = dataBll.getStatistics(group);

        if (dataList != null)
        {
            ReturnData(1, "成功", dataList);
        }
        else
        {
            ReturnData(0, "失败", null);
        }
    }
    #endregion

    #region 9. web端获取摄像头数据
    /// <summary>
    /// web端获取实时统计的用户数据
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = "9.  web端获取摄像头数据")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getCamera(string para)
    {
        BLL.MlsCameraBLL dataBll = new MlsCameraBLL();

        var dataList = dataBll.GetDataByCode("{'order':' ID asc '}");

        if (dataList != null)
        {
            ReturnData(1, "成功", dataList);
        }
        else
        {
            ReturnData(0, "失败", null);
        }
    }
    #endregion

    #region 10. 萤石的http请求
    /// <summary>
    /// 后台中转萤石的http请求
    /// </summary>
    /// <param name="para"></param>
    [WebMethod(Description = " 10. 萤石的http请求")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public void getYsApiData(string para)
    {
        string url = joPara["url"].ToString();//url
        string sendData = joPara["sendData"].ToString();//发送数据
        if (sendData == "")
        {
            ReturnData(0, "失败", "请求的sendData不可为空!");
        }
        //萤石引用信息
        string appKey = ConfigString.strAppKey;
        string appSecret = ConfigString.strAppSecret;
        string appPhone = ConfigString.strAppPhone;
        //请求链接
        //先获取accessToken
        string accessToken = UrlAction("https://open.ys7.com/api/lapp/token/get?appKey=" + appKey + "&appSecret=" + appSecret);
        //再在accesToken的基础上请求api操作
        var data=JObject.Parse(accessToken);
        accessToken = data["data"]["accessToken"].ToString();
        string backMsg = "";
        url += "?accessToken=" + accessToken + "&" + sendData;
        try
        {
            backMsg=UrlAction(url);
            ReturnData(1, "成功", backMsg);
        }
        catch (Exception)
        {
            ReturnData(0, "失败", null);
        }
    }
    /// <summary>
    /// urlAction
    /// </summary>
    /// <param name="url"></param>
    /// <returns></returns>
    private string UrlAction(string url)
    {
        string backMsg = "";
        try
        {
            System.Net.HttpWebRequest httpRquest = System.Net.HttpWebRequest.CreateHttp(url);
            httpRquest.Method = "POST";
            //httpRquest.ContentType = "application/x-www-form-urlencoded;charset=UTF-8";
            System.IO.Stream requestStream = httpRquest.GetRequestStream();

            System.Net.WebResponse response = httpRquest.GetResponse();
            System.IO.Stream responseStream = response.GetResponseStream();
            System.IO.StreamReader reader = new System.IO.StreamReader(responseStream, System.Text.Encoding.UTF8);
            backMsg = reader.ReadToEnd();

            reader.Close();
            reader.Dispose();

            requestStream.Close();
            requestStream.Dispose();
            responseStream.Close();
            responseStream.Dispose();
            //{"data":{"accessToken":"at.6rsjqr08aeiccexsc1jol8ql9rrx3wgo-3r89kctbjv-15mpaot-ur746icrn","expireTime":1497572707259},"code":"200","msg":"操作成功!"}
            return backMsg;
        }
        catch (Exception)
        {
            return "";
        }
    }
    #endregion

    #region  公共函数
    /// <summary>
    /// 返回数据
    /// </summary>
    /// <param name="code">代码</param>
    /// <param name="desc">描述</param>
    /// <param name="data">数据</param>
    private void ReturnData(int code, string desc, object data)
    {
        DataResult objDataResult = new DataResult();
        objDataResult.RespCode = code;
        objDataResult.RespDesc = desc;

        if (code != 0)
        {
            objDataResult.Results = data;
        }

        Context.Response.ContentEncoding = AppConfig.Encoding;
        Context.Response.Write(JsonConvert.SerializeObject(objDataResult));

        #region 记录接口使用日志
        if (AppConfig.strLogLogMode == "0")
        {
            RecordInterfaceToFile(joPara, objDataResult);
            RecordInterfaceToDb(joPara, objDataResult);
        }
        else if (AppConfig.strLogLogMode == "1")
        {
            RecordInterfaceToFile(joPara, objDataResult);
        }
        else if (AppConfig.strLogLogMode == "2")
        {
            RecordInterfaceToDb(joPara, objDataResult);
        }
        #endregion
    }

    /// <summary>
    /// 执行请求之前的准备工作
    /// </summary>
    private void initVRequest()
    {
        bool tag = true;
        string strPara = HttpContext.Current.Request.Params["para"];
        try
        {
            joPara = JObject.Parse(strPara);
            string strToken = joPara["Token"].ToString();
            string strDToken = DesUtil.Base64Decode(strToken);

            NameValueCollection colParams = new NameValueCollection();
            tokenModel = new TokenModel();
            colParams = DesUtil.GetQueryString(strDToken);
            tokenModel.time = colParams["time"];
            tokenModel.num = colParams["num"];
            tokenModel.accessToken = colParams["accessToken"];
            tokenModel.appId = colParams["appId"];
            tokenModel.version = colParams["version"];
            tokenModel.platform = colParams["platform"];
            tokenModel.phoneUUID = colParams["phoneUUID"];

            string strValidate = DesUtil.Encrypt(tokenModel.time + "_" + tokenModel.num);
            if (tokenModel.accessToken != strValidate || tokenModel.accessToken == null)
            {
                tag = false;
                ReturnData(0, "密钥无效", "");
            }
        }
        catch (Exception ex)
        {
            tag = false;
            ErrorUtil.RecordErrorToFile(ex, strPara, Context);
            ReturnData(0, "参数有误，请重新输入", ex);
        }
        finally
        {
            if (!tag)
            {
                Context.Response.End();
            }
        }
    }

    /// <summary>
    /// 执行请求之前的准备工作
    /// </summary>
    private void initPRequest()
    {
        bool tag = true;
        string strPara = HttpContext.Current.Request.Params["para"];

        try
        {
            joPara = JObject.Parse(strPara);
        }
        catch (Exception ex)
        {
            tag = false;
            ErrorUtil.RecordErrorToFile(ex, strPara, Context);
            ReturnData(0, "参数有误，请重新输入", "");
        }
        finally
        {
            if (!tag)
            {
                Context.Response.End();
            }
        }
    }
    #endregion

    #region 调用函数
    private void IsValidLoginUUID()
    {
        BLL.SysUserBLL bll = new SysUserBLL();
        List<AdminLoginLogModel> logList = bll.GetLogsByUUID(tokenModel.appId);
        if (logList.Count > 0)
        {
            ReturnData(2, "您已经被迫下线", "");
        }
        else
        {
            ReturnData(0, "用户不存在", "");
        }
    }

    public static void RecordInterfaceToFile(JObject jo, Object result)
    {
        try
        {
            jo["DToken"] = JObject.FromObject(tokenModel);
            jo["Result"] = JObject.FromObject(result);
            JObject joFile = new JObject();
            string[] urlSegments = HttpContext.Current.Request.Url.Segments;
            string interfaceName = "\"InterfaceName\":\"" + urlSegments[urlSegments.Length - 1] + "\"";


            //取得当前需要写入的日志文件名称及路径
            string strFullPath = AppConfig.strLogPath + @"\" + AppConfig.interfaceFileName;

            //取得异常信息的内容
            string strTime = "\r\n ------BEGIN----------------------------" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "------------------------------\r\n";
            string logInfo = strTime + interfaceName + "\r\n" + jo.ToString();
            logInfo += ("\r\n ------END-----------------------------------------------------------------------------\r\n");

            //执行写入
            //检查 Log 文件所存放的目录是否存在,如果不存在，建立该文件夹
            if (!Directory.Exists(AppConfig.strLogPath))
            {
                Directory.CreateDirectory(AppConfig.strLogPath);
            }

            //判断当前的日志文件是否创建，如果未创建，执行创建并加入异常内容；
            //如果已经创建则直接追加填写
            if (!File.Exists(strFullPath))
            {
                using (StreamWriter sw = File.CreateText(strFullPath))
                {
                    sw.Write(logInfo);
                    sw.Flush();
                }
            }
            else
            {
                using (StreamWriter sw = File.AppendText(strFullPath))
                {
                    sw.Write(logInfo);
                    sw.Flush();
                }
            }
        }
        catch
        {
            return;
        }
    }
    public static void RecordInterfaceToDb(JObject jo, Object result)
    {
        try
        {
            jo["DToken"] = JObject.FromObject(tokenModel);
            jo["Result"] = JObject.FromObject(result);
            AppInterfaceLogModel model = new AppInterfaceLogModel();
            string[] urlSegments = HttpContext.Current.Request.Url.Segments;
            model.InterfaceName = urlSegments[urlSegments.Length - 1];
            model.Parameter = JObject.Parse(JsonConvert.SerializeObject(jo)).ToString();
            model.UseDateTime = DateTime.Now;
            model.PhoneUUID = tokenModel.phoneUUID;
            model.DataSource = tokenModel.platform;
            AppInterfaceLogBLL bll = new AppInterfaceLogBLL();
            bll.Add(model);
        }
        catch
        {
            return;
        }
    }
    #endregion
}